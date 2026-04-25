const { Op } = require('sequelize');
const {
  Rehabilitation,
  RehabSession,
  Player,
  Injury,
  User,
  sequelize,
} = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { broadcastToClub } = require('../services/notification.service');

// ==========================================
// الحصول على قائمة برامج التأهيل
// ==========================================
exports.getAllPrograms = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      player_id = '',
      status = '',
      therapist_id = '',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { club_id: clubId };
    if (player_id) where.player_id = player_id;
    if (status) where.status = status;
    if (therapist_id) where.therapist_id = therapist_id;
    if (search) {
      where[Op.or] = [
        { program_name: { [Op.like]: `%${search}%` } },
        { goals: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: programs } = await Rehabilitation.findAndCountAll({
      where,
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'avatar_url', 'status'],
        },
        {
          model: Injury,
          as: 'injury',
          attributes: ['id', 'injury_type', 'body_area', 'severity'],
          required: false,
        },
        {
          model: User,
          as: 'therapist',
          attributes: ['id', 'name', 'role'],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    // إحصائيات سريعة
    const stats = await Rehabilitation.findAll({
      where: { club_id: clubId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const statsByStatus = {};
    stats.forEach((s) => {
      statsByStatus[s.status] = parseInt(s.count);
    });

    return res.json({
      success: true,
      data: programs,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
      stats: {
        total: count,
        byStatus: statsByStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب برامج التأهيل');
  }
};

// ==========================================
// الحصول على تفاصيل برنامج تأهيل
// ==========================================
exports.getProgramById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const program = await Rehabilitation.findOne({
      where: { id, club_id: clubId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'avatar_url', 'status', 'phone'],
        },
        {
          model: Injury,
          as: 'injury',
          attributes: ['id', 'injury_type', 'body_area', 'severity', 'injury_date', 'status'],
          required: false,
        },
        {
          model: User,
          as: 'therapist',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
        {
          model: RehabSession,
          as: 'sessions',
          include: [
            {
              model: User,
              as: 'sessionTherapist',
              attributes: ['id', 'name'],
              required: false,
            },
          ],
          order: [['session_date', 'DESC']],
          required: false,
        },
      ],
    });

    if (!program) {
      return ApiResponse.notFound(res, 'برنامج التأهيل غير موجود');
    }

    // إحصائيات الجلسات
    const sessions = program.sessions || [];
    const sessionStats = {
      total: sessions.length,
      attended: sessions.filter((s) => s.attendance === 'attended').length,
      missed: sessions.filter((s) => s.attendance === 'missed').length,
      cancelled: sessions.filter((s) => s.attendance === 'cancelled').length,
      avgPainLevel: sessions.length
        ? parseFloat(
            (
              sessions.filter((s) => s.pain_level !== null).reduce((a, b) => a + b.pain_level, 0) /
              Math.max(sessions.filter((s) => s.pain_level !== null).length, 1)
            ).toFixed(1)
          )
        : null,
      totalMinutes: sessions.reduce((a, b) => a + (b.duration_minutes || 0), 0),
    };

    // أيام منذ البداية
    const daysElapsed = program.start_date
      ? Math.floor((new Date() - new Date(program.start_date)) / (1000 * 60 * 60 * 24))
      : 0;

    // الأيام المتبقية
    let daysRemaining = null;
    if (program.expected_end_date && program.status !== 'completed') {
      daysRemaining = Math.max(
        0,
        Math.floor((new Date(program.expected_end_date) - new Date()) / (1000 * 60 * 60 * 24))
      );
    }

    return res.json({
      success: true,
      data: {
        ...program.toJSON(),
        sessionStats,
        daysElapsed,
        daysRemaining,
      },
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات البرنامج');
  }
};

// ==========================================
// إنشاء برنامج تأهيل جديد
// ==========================================
exports.createProgram = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const clubId = req.user.clubId;
    const {
      player_id,
      injury_id,
      program_name,
      phase,
      phase_label,
      start_date,
      expected_end_date,
      therapist_id,
      goals,
      exercises_description,
      notes,
    } = req.body;

    if (!player_id || !program_name || !start_date) {
      await transaction.rollback();
      return ApiResponse.validationError(res, [], 'اللاعب واسم البرنامج وتاريخ البداية مطلوبة');
    }

    // التحقق من وجود اللاعب
    const player = await Player.findOne({ where: { id: player_id, club_id: clubId }, transaction });
    if (!player) {
      await transaction.rollback();
      return ApiResponse.notFound(res, 'اللاعب غير موجود');
    }

    // التحقق من الإصابة المرتبطة
    if (injury_id) {
      const injury = await Injury.findOne({ where: { id: injury_id, club_id: clubId }, transaction });
      if (!injury) {
        await transaction.rollback();
        return ApiResponse.notFound(res, 'الإصابة المرتبطة غير موجودة');
      }
    }

    // التحقق من المعالج
    if (therapist_id) {
      const therapist = await User.findOne({ where: { id: therapist_id, club_id: clubId }, transaction });
      if (!therapist) {
        await transaction.rollback();
        return ApiResponse.notFound(res, 'المعالج غير موجود');
      }
    }

    const program = await Rehabilitation.create(
      {
        club_id: clubId,
        player_id,
        injury_id: injury_id || null,
        program_name,
        phase: phase || 1,
        phase_label: phase_label || null,
        progress_pct: 0,
        start_date,
        expected_end_date: expected_end_date || null,
        therapist_id: therapist_id || null,
        status: 'active',
        goals: goals || null,
        exercises_description: exercises_description || null,
        notes: notes || null,
      },
      { transaction }
    );

    // تحديث حالة اللاعب إلى تأهيل
    if (player.status === 'injured' || player.status === 'ready') {
      await player.update({ status: 'rehab' }, { transaction });
    }

    await transaction.commit();

    const fullProgram = await Rehabilitation.findByPk(program.id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position', 'avatar_url'] },
        { model: Injury, as: 'injury', attributes: ['id', 'injury_type', 'body_area'], required: false },
        { model: User, as: 'therapist', attributes: ['id', 'name'], required: false },
      ],
    });

    broadcastToClub(clubId, 'rehab_started', 'بدء برنامج تأهيل',
      `تم بدء برنامج التأهيل "${program_name}" للاعب ${player.name}`,
      'Rehabilitation', program.id, 'medium').catch(() => {});

    return ApiResponse.created(res, fullProgram, 'تم إنشاء برنامج التأهيل بنجاح');
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating program:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء برنامج التأهيل');
  }
};

// ==========================================
// تحديث برنامج تأهيل
// ==========================================
exports.updateProgram = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const updateData = { ...req.body };

    const program = await Rehabilitation.findOne({ where: { id, club_id: clubId } });
    if (!program) return ApiResponse.notFound(res, 'برنامج التأهيل غير موجود');

    // التحقق من المعالج الجديد
    if (updateData.therapist_id) {
      const therapist = await User.findOne({ where: { id: updateData.therapist_id, club_id: clubId } });
      if (!therapist) return ApiResponse.notFound(res, 'المعالج غير موجود');
    }

    await program.update(updateData);

    const updated = await Rehabilitation.findByPk(id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position', 'avatar_url'] },
        { model: Injury, as: 'injury', attributes: ['id', 'injury_type', 'body_area'], required: false },
        { model: User, as: 'therapist', attributes: ['id', 'name'], required: false },
      ],
    });

    return ApiResponse.success(res, updated, 'تم تحديث برنامج التأهيل بنجاح');
  } catch (error) {
    console.error('Error updating program:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث البرنامج');
  }
};

// ==========================================
// تحديث حالة البرنامج (إكمال / إيقاف / إلغاء)
// ==========================================
exports.updateProgramStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { status, actual_end_date, notes } = req.body;

    const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return ApiResponse.validationError(res, [], 'حالة غير صالحة');
    }

    const program = await Rehabilitation.findOne({
      where: { id, club_id: clubId },
      include: [{ model: Player, as: 'player' }],
      transaction,
    });

    if (!program) {
      await transaction.rollback();
      return ApiResponse.notFound(res, 'البرنامج غير موجود');
    }

    const updateFields = { status };
    if (status === 'completed') {
      updateFields.actual_end_date = actual_end_date || new Date().toISOString().split('T')[0];
      updateFields.progress_pct = 100;
    }
    if (notes) updateFields.notes = notes ? `${program.notes || ''}\n${notes}`.trim() : program.notes;

    await program.update(updateFields, { transaction });

    // تحديث حالة اللاعب عند اكتمال البرنامج أو إلغائه
    if (status === 'completed' || status === 'cancelled') {
      // التحقق من وجود برامج نشطة أخرى
      const otherActive = await Rehabilitation.findOne({
        where: {
          player_id: program.player_id,
          status: 'active',
          id: { [Op.ne]: id },
        },
        transaction,
      });

      if (!otherActive && program.player) {
        await program.player.update({ status: 'ready' }, { transaction });
      }
    }

    await transaction.commit();
    return ApiResponse.success(res, program, 'تم تحديث حالة البرنامج بنجاح');
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating program status:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث حالة البرنامج');
  }
};

// ==========================================
// تحديث المرحلة والتقدم
// ==========================================
exports.updateProgress = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { phase, phase_label, progress_pct } = req.body;

    const program = await Rehabilitation.findOne({ where: { id, club_id: clubId } });
    if (!program) return ApiResponse.notFound(res, 'البرنامج غير موجود');

    const updateFields = {};
    if (phase !== undefined) updateFields.phase = Math.min(Math.max(parseInt(phase), 1), 4);
    if (phase_label !== undefined) updateFields.phase_label = phase_label;
    if (progress_pct !== undefined) updateFields.progress_pct = Math.min(Math.max(parseFloat(progress_pct), 0), 100);

    await program.update(updateFields);
    return ApiResponse.success(res, program, 'تم تحديث التقدم بنجاح');
  } catch (error) {
    console.error('Error updating progress:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث التقدم');
  }
};

// ==========================================
// حذف برنامج تأهيل
// ==========================================
exports.deleteProgram = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const program = await Rehabilitation.findOne({ where: { id, club_id: clubId } });
    if (!program) return ApiResponse.notFound(res, 'البرنامج غير موجود');

    // حذف الجلسات أولاً
    await RehabSession.destroy({ where: { program_id: id } });
    await program.destroy();

    return ApiResponse.success(res, null, 'تم حذف برنامج التأهيل بنجاح');
  } catch (error) {
    console.error('Error deleting program:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف البرنامج');
  }
};

// ==========================================
// إحصائيات التأهيل
// ==========================================
exports.getRehabStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    // توزيع الحالات
    const statusDist = await Rehabilitation.findAll({
      where: { club_id: clubId },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // متوسط مدة البرامج المكتملة
    const completedPrograms = await Rehabilitation.findAll({
      where: { club_id: clubId, status: 'completed', actual_end_date: { [Op.ne]: null } },
      attributes: ['start_date', 'actual_end_date'],
      raw: true,
    });

    let avgDuration = null;
    if (completedPrograms.length > 0) {
      const totalDays = completedPrograms.reduce((sum, p) => {
        const days = Math.floor(
          (new Date(p.actual_end_date) - new Date(p.start_date)) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgDuration = Math.round(totalDays / completedPrograms.length);
    }

    // إجمالي جلسات الشهر الحالي
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlySessions = await RehabSession.count({
      where: {
        club_id: clubId,
        session_date: { [Op.gte]: monthStart.toISOString().split('T')[0] },
      },
    });

    // نسبة الحضور الكلية
    const totalSessions = await RehabSession.count({ where: { club_id: clubId } });
    const attendedSessions = await RehabSession.count({
      where: { club_id: clubId, attendance: 'attended' },
    });
    const attendanceRate =
      totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

    // جلسات آخر 30 يوم (للرسم البياني)
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const sessionsTrend = await RehabSession.findAll({
      where: {
        club_id: clubId,
        session_date: { [Op.gte]: last30.toISOString().split('T')[0] },
      },
      attributes: [
        ['session_date', 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('pain_level')), 'avgPain'],
      ],
      group: ['session_date'],
      order: [['session_date', 'ASC']],
      raw: true,
    });

    // أكثر المعالجين نشاطاً
    const topTherapists = await RehabSession.findAll({
      where: { club_id: clubId, therapist_id: { [Op.ne]: null } },
      attributes: [
        'therapist_id',
        [sequelize.fn('COUNT', sequelize.col('RehabSession.id')), 'sessions'],
      ],
      include: [
        { model: User, as: 'sessionTherapist', attributes: ['id', 'name'], required: false },
      ],
      group: ['therapist_id', 'sessionTherapist.id', 'sessionTherapist.name'],
      order: [[sequelize.literal('sessions'), 'DESC']],
      limit: 5,
    });

    return res.json({
      success: true,
      data: {
        statusDistribution: statusDist,
        avgDuration,
        monthlySessions,
        attendanceRate,
        totalSessions,
        attendedSessions,
        sessionsTrend,
        topTherapists,
      },
    });
  } catch (error) {
    console.error('Error fetching rehab stats:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب الإحصائيات');
  }
};

// ==========================================
// الحصول على قائمة المعالجين
// ==========================================
exports.getTherapists = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const therapists = await User.findAll({
      where: {
        club_id: clubId,
        is_active: true,
        role: { [Op.in]: ['doctor', 'physiotherapist', 'nurse'] },
      },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']],
    });
    return ApiResponse.success(res, therapists);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب قائمة المعالجين');
  }
};

// ==========================================
// إضافة جلسة تأهيل
// ==========================================
exports.addSession = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { programId } = req.params;
    const {
      session_date,
      duration_minutes,
      session_type,
      exercises_done,
      pain_level,
      progress_notes,
      attendance,
    } = req.body;

    const program = await Rehabilitation.findOne({ where: { id: programId, club_id: clubId } });
    if (!program) return ApiResponse.notFound(res, 'برنامج التأهيل غير موجود');
    if (program.status === 'completed' || program.status === 'cancelled') {
      return ApiResponse.error(res, 'لا يمكن إضافة جلسة لبرنامج مكتمل أو ملغى', 400);
    }

    if (!session_date) {
      return ApiResponse.validationError(res, [], 'تاريخ الجلسة مطلوب');
    }

    const session = await RehabSession.create({
      club_id: clubId,
      program_id: programId,
      player_id: program.player_id,
      therapist_id: req.body.therapist_id || program.therapist_id || null,
      session_date,
      duration_minutes: duration_minutes || null,
      session_type: session_type || null,
      exercises_done: exercises_done || null,
      pain_level: pain_level !== undefined && pain_level !== '' ? parseInt(pain_level) : null,
      progress_notes: progress_notes || null,
      attendance: attendance || 'attended',
    });

    // تحديث التقدم تلقائياً بناءً على الجلسات المنجزة
    if (attendance === 'attended') {
      const attendedCount = await RehabSession.count({
        where: { program_id: programId, attendance: 'attended' },
      });
      // تقييم التقدم: كل 10 جلسات = 10%، بحد أقصى 95%
      const autoProgress = Math.min(95, attendedCount * 5);
      if (autoProgress > (program.progress_pct || 0)) {
        await program.update({ progress_pct: autoProgress });
      }
    }

    const fullSession = await RehabSession.findByPk(session.id, {
      include: [
        { model: User, as: 'sessionTherapist', attributes: ['id', 'name'], required: false },
      ],
    });

    return ApiResponse.created(res, fullSession, 'تم تسجيل الجلسة بنجاح');
  } catch (error) {
    console.error('Error adding session:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل الجلسة');
  }
};

// ==========================================
// تحديث جلسة تأهيل
// ==========================================
exports.updateSession = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { sessionId } = req.params;
    const updateData = { ...req.body };

    const session = await RehabSession.findOne({ where: { id: sessionId, club_id: clubId } });
    if (!session) return ApiResponse.notFound(res, 'الجلسة غير موجودة');

    if (updateData.pain_level !== undefined && updateData.pain_level !== '') {
      updateData.pain_level = parseInt(updateData.pain_level);
    }

    await session.update(updateData);
    return ApiResponse.success(res, session, 'تم تحديث الجلسة بنجاح');
  } catch (error) {
    console.error('Error updating session:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث الجلسة');
  }
};

// ==========================================
// حذف جلسة تأهيل
// ==========================================
exports.deleteSession = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { sessionId } = req.params;

    const session = await RehabSession.findOne({ where: { id: sessionId, club_id: clubId } });
    if (!session) return ApiResponse.notFound(res, 'الجلسة غير موجودة');

    await session.destroy();
    return ApiResponse.success(res, null, 'تم حذف الجلسة بنجاح');
  } catch (error) {
    console.error('Error deleting session:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف الجلسة');
  }
};
