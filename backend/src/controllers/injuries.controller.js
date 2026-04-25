const { Op } = require('sequelize');
const { Injury, Player, User, Rehabilitation, sequelize } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { notifyInjuryCreated, notifyInjuryRecovered } = require('../services/notification.service');

// ==========================================
// الحصول على قائمة الإصابات
// ==========================================
exports.getAllInjuries = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      search = '',
      player_id = '',
      severity = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = {
      club_id: clubId,
    };

    // فلترة اللاعب
    if (player_id) {
      whereCondition.player_id = player_id;
    }

    // فلترة الشدة
    if (severity) {
      whereCondition.severity = severity;
    }

    // فلترة الحالة
    if (status) {
      const statusValues = status.split(',').map(s => s.trim()).filter(Boolean);
      whereCondition.status = statusValues.length === 1 ? statusValues[0] : { [Op.in]: statusValues };
    }

    // فلترة التاريخ
    if (dateFrom) {
      whereCondition.injury_date = { ...whereCondition.injury_date, [Op.gte]: dateFrom };
    }
    if (dateTo) {
      whereCondition.injury_date = { ...whereCondition.injury_date, [Op.lte]: dateTo };
    }

    // البحث
    if (search) {
      whereCondition[Op.or] = [
        { injury_type: { [Op.like]: `%${search}%` } },
        { body_area: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: injuries } = await Injury.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'avatar_url'],
        },
        {
          model: User,
          as: 'treatingDoctor',
          attributes: ['id', 'name'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    // إحصائيات
    const stats = await Injury.findAll({
      where: { club_id: clubId },
      attributes: [
        'status',
        'severity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status', 'severity'],
      raw: true,
    });

    const statsByStatus = {};
    const statsBySeverity = {};
    stats.forEach((item) => {
      if (item.status) {
        statsByStatus[item.status] = (statsByStatus[item.status] || 0) + parseInt(item.count);
      }
      if (item.severity) {
        statsBySeverity[item.severity] = parseInt(item.count);
      }
    });

    res.json({
      success: true,
      data: injuries,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
      stats: {
        total: count,
        byStatus: statsByStatus,
        bySeverity: statsBySeverity,
      },
    });
  } catch (error) {
    console.error('Error fetching injuries:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب قائمة الإصابات');
  }
};

// ==========================================
// الحصول على إحصائيات الإصابات للرسوم البيانية
// ==========================================
exports.getInjuryStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    // الإصابات حسب الأسبوع
    const injuriesByWeek = await Injury.findAll({
      where: {
        club_id: clubId,
        injury_date: { [Op.gte]: startDate },
      },
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('injury_date')), 'year'],
        [sequelize.fn('WEEK', sequelize.col('injury_date')), 'week'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['year', 'week'],
      raw: true,
      order: [['year', 'ASC'], ['week', 'ASC']],
    });

    // الإصابات حسب منطقة الجسم
    const injuriesByArea = await Injury.findAll({
      where: { club_id: clubId },
      attributes: [
        'body_area',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['body_area'],
      order: [[sequelize.literal('count'), 'DESC']],
      raw: true,
    });

    // الإصابات حسب الشدة
    const injuriesBySeverity = await Injury.findAll({
      where: { club_id: clubId },
      attributes: [
        'severity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['severity'],
      raw: true,
    });

    // متوسط وقت التعافي
    const recoveryStats = await Injury.findAll({
      where: {
        club_id: clubId,
        status: 'closed',
        actual_recovery_days: { [Op.ne]: null },
      },
      attributes: [
        'severity',
        [sequelize.fn('AVG', sequelize.col('actual_recovery_days')), 'avgDays'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['severity'],
      raw: true,
    });

    // توزيع الحالات
    const statusDistribution = await Injury.findAll({
      where: { club_id: clubId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        byWeek: injuriesByWeek,
        byArea: injuriesByArea,
        bySeverity: injuriesBySeverity,
        recoveryStats,
        statusDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching injury stats:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب إحصائيات الإصابات');
  }
};

// ==========================================
// الحصول على تفاصيل إصابة
// ==========================================
exports.getInjuryById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const injury = await Injury.findOne({
      where: { id, club_id: clubId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'status', 'avatar_url', 'nationality', 'phone'],
        },
        {
          model: User,
          as: 'treatingDoctor',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
        {
          model: Rehabilitation,
          as: 'rehabilitation',
          required: false,
        },
      ],
    });

    if (!injury) {
      return ApiResponse.notFound(res, 'الإصابة غير موجودة');
    }

    // حساب الأيام منذ الإصابة
    const daysSinceInjury = injury.injury_date
      ? Math.floor((new Date() - new Date(injury.injury_date)) / (1000 * 60 * 60 * 24))
      : 0;

    // حساب أيام التعافي المتبقية
    let daysRemaining = null;
    if (injury.expected_recovery_days && injury.status !== 'closed') {
      daysRemaining = Math.max(0, injury.expected_recovery_days - daysSinceInjury);
    }

    res.json({
      success: true,
      data: {
        ...injury.toJSON(),
        daysSinceInjury,
        daysRemaining,
      },
    });
  } catch (error) {
    console.error('Error fetching injury:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات الإصابة');
  }
};

// ==========================================
// إنشاء إصابة جديدة
// ==========================================
exports.createInjury = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const {
      player_id,
      injury_type,
      body_area,
      body_side,
      severity,
      expected_recovery_days,
      injury_date,
      return_date,
      treating_doctor_id,
      mechanism,
      occurred_during,
      is_recurring,
      recurrence_count,
      description,
      treatment_plan,
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!player_id || !injury_type || !body_area || !severity || !expected_recovery_days || !injury_date) {
      return ApiResponse.validationError(res, [], 'البيانات المطلوبة غير مكتملة');
    }

    // التحقق من وجود اللاعب
    const player = await Player.findOne({
      where: { id: player_id, club_id: clubId },
      transaction,
    });

    if (!player) {
      await transaction.rollback();
      return ApiResponse.notFound(res, 'اللاعب غير موجود');
    }

    // التحقق من الطبيب المعالج (اختياري)
    if (treating_doctor_id) {
      const doctor = await User.findOne({
        where: { id: treating_doctor_id, club_id: clubId },
        transaction,
      });

      if (!doctor) {
        await transaction.rollback();
        return ApiResponse.notFound(res, 'الطبيب المعالج غير موجود');
      }
    }

    // إنشاء الإصابة
    const injury = await Injury.create({
      club_id: clubId,
      player_id,
      injury_type,
      body_area,
      body_side,
      severity,
      expected_recovery_days,
      injury_date,
      return_date,
      treating_doctor_id,
      mechanism,
      occurred_during,
      is_recurring: is_recurring || false,
      recurrence_count: recurrence_count || 0,
      description,
      treatment_plan,
      status: 'active',
      created_by: userId,
    }, { transaction });

    // تحديث حالة اللاعب
    await player.update({ status: 'injured' }, { transaction });

    await transaction.commit();

    // جلب الإصابة الكاملة
    const fullInjury = await Injury.findByPk(injury.id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number'] },
        { model: User, as: 'treatingDoctor', attributes: ['id', 'name'] },
      ],
    });

    notifyInjuryCreated(clubId, userId, player.name, injury_type, severity, injury.id).catch(() => {});

    return ApiResponse.created(res, fullInjury, 'تم تسجيل الإصابة بنجاح');
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating injury:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل الإصابة');
  }
};

// ==========================================
// تحديث إصابة
// ==========================================
exports.updateInjury = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const updateData = req.body;

    const injury = await Injury.findOne({
      where: { id, club_id: clubId },
      transaction,
    });

    if (!injury) {
      await transaction.rollback();
      return ApiResponse.notFound(res, 'الإصابة غير موجودة');
    }

    // التحقق من اللاعب إذا تم تغييره
    if (updateData.player_id) {
      const player = await Player.findOne({
        where: { id: updateData.player_id, club_id: clubId },
        transaction,
      });
      if (!player) {
        await transaction.rollback();
        return ApiResponse.notFound(res, 'اللاعب غير موجود');
      }
    }

    // التحقق من الطبيب المعالج إذا تم تغييره
    if (updateData.treating_doctor_id) {
      const doctor = await User.findOne({
        where: { id: updateData.treating_doctor_id, club_id: clubId },
        transaction,
      });
      if (!doctor) {
        await transaction.rollback();
        return ApiResponse.notFound(res, 'الطبيب المعالج غير موجود');
      }
    }

    await injury.update(updateData, { transaction });
    await transaction.commit();

    // جلب الإصابة المحدثة
    const updatedInjury = await Injury.findByPk(id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number'] },
        { model: User, as: 'treatingDoctor', attributes: ['id', 'name'] },
      ],
    });

    return ApiResponse.success(res, updatedInjury, 'تم تحديث بيانات الإصابة بنجاح');
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating injury:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث بيانات الإصابة');
  }
};

// ==========================================
// إغلاق إصابة (تعافى)
// ==========================================
exports.closeInjury = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { return_date, actual_recovery_days, notes } = req.body;

    const injury = await Injury.findOne({
      where: { id, club_id: clubId },
      include: [{ model: Player, as: 'player' }],
      transaction,
    });

    if (!injury) {
      await transaction.rollback();
      return ApiResponse.notFound(res, 'الإصابة غير موجودة');
    }

    if (injury.status === 'closed') {
      await transaction.rollback();
      return ApiResponse.error(res, 'الإصابة مغلقة بالفعل');
    }

    // حساب أيام التعافي الفعلية
    const calculatedDays = actual_recovery_days ||
      Math.floor((new Date(return_date || new Date()) - new Date(injury.injury_date)) / (1000 * 60 * 60 * 24));

    await injury.update({
      status: 'closed',
      return_date: return_date || new Date(),
      actual_recovery_days: calculatedDays,
      notes: notes ? `${injury.notes || ''}\n${notes}` : injury.notes,
    }, { transaction });

    // تحديث حالة اللاعب - التحقق من وجود إصابات نشطة أخرى
    const otherActiveInjuries = await Injury.findOne({
      where: {
        player_id: injury.player_id,
        status: { [Op.in]: ['active', 'recovering'] },
        id: { [Op.ne]: injury.id },
      },
      transaction,
    });

    if (!otherActiveInjuries) {
      // التحقق من وجود برنامج تأهيل نشط
      const activeRehab = await Rehabilitation.findOne({
        where: {
          player_id: injury.player_id,
          status: 'active',
        },
        transaction,
      });

      if (activeRehab) {
        await injury.player.update({ status: 'rehab' }, { transaction });
      } else {
        await injury.player.update({ status: 'ready' }, { transaction });
      }
    }

    await transaction.commit();

    notifyInjuryRecovered(clubId, req.user.userId, injury.player?.name || 'اللاعب', injury.id).catch(() => {});

    return ApiResponse.success(res, injury, 'تم تسجيل تعافي اللاعب بنجاح');
  } catch (error) {
    await transaction.rollback();
    console.error('Error closing injury:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل التعافي');
  }
};

// ==========================================
// تحديث حالة الإصابة
// ==========================================
exports.updateInjuryStatus = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'recovering', 'closed'].includes(status)) {
      return ApiResponse.validationError(res, [], 'حالة غير صالحة');
    }

    const injury = await Injury.findOne({
      where: { id, club_id: clubId },
    });

    if (!injury) {
      return ApiResponse.notFound(res, 'الإصابة غير موجودة');
    }

    const updateData = { status };

    // إذا تم الإغلاق، حساب أيام التعافي
    if (status === 'closed' && !injury.actual_recovery_days) {
      updateData.return_date = new Date();
      updateData.actual_recovery_days = Math.floor(
        (new Date() - new Date(injury.injury_date)) / (1000 * 60 * 60 * 24)
      );
    }

    await injury.update(updateData);

    return ApiResponse.success(res, injury, 'تم تحديث حالة الإصابة بنجاح');
  } catch (error) {
    console.error('Error updating injury status:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث حالة الإصابة');
  }
};

// ==========================================
// حذف إصابة
// ==========================================
exports.deleteInjury = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const injury = await Injury.findOne({
      where: { id, club_id: clubId },
    });

    if (!injury) {
      return ApiResponse.notFound(res, 'الإصابة غير موجودة');
    }

    // التحقق من عدم وجود برنامج تأهيل مرتبط
    const hasRehab = await Rehabilitation.findOne({
      where: { injury_id: id },
    });

    if (hasRehab) {
      return ApiResponse.error(res, 'لا يمكن حذف الإصابة لوجود برنامج تأهيل مرتبط بها');
    }

    await injury.destroy();

    return ApiResponse.success(res, null, 'تم حذف الإصابة بنجاح');
  } catch (error) {
    console.error('Error deleting injury:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف الإصابة');
  }
};

// ==========================================
// الحصول على قائمة الأطباء المعالجين
// ==========================================
exports.getDoctors = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    const doctors = await User.findAll({
      where: {
        club_id: clubId,
        is_active: true,
        role: { [Op.in]: ['doctor', 'physiotherapist'] },
      },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']],
    });

    return ApiResponse.success(res, doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب قائمة الأطباء');
  }
};
