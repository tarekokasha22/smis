const { Op } = require('sequelize');
const { Player, Injury, Rehabilitation, Vital, Performance, Appointment, sequelize } = require('../models');

// ==========================================
// الحصول على قائمة اللاعبين
// ==========================================
exports.getAllPlayers = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      position = '',
      is_active = 'true',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // بناء شرط البحث
    const whereCondition = {
      club_id: clubId,
    };

    // فلترة الحالة النشطة
    if (is_active === 'true') {
      whereCondition.is_active = true;
    } else if (is_active === 'false') {
      whereCondition.is_active = false;
    }

    // فلترة الحالة
    if (status) {
      whereCondition.status = status;
    }

    // فلترة المركز
    if (position) {
      whereCondition.position = position;
    }

    // البحث
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { number: { [Op.like]: `%${search}%` } },
      ];
    }

    // جلب اللاعبين
    const { count, rows: players } = await Player.findAndCountAll({
      where: whereCondition,
      attributes: [
        'id', 'name', 'number', 'position', 'status', 'nationality',
        'date_of_birth', 'height', 'weight', 'blood_type', 'dominant_foot',
        'avatar_url', 'is_active', 'created_at', 'updated_at'
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    // إحصائيات سريعة
    const stats = await Player.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true,
    });

    const statsMap = stats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    res.json({
      success: true,
      data: players,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
      stats: {
        total: count,
        byStatus: statsMap,
      },
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب قائمة اللاعبين',
    });
  }
};

// ==========================================
// الحصول على البيانات الوصفية (فلاتر)
// ==========================================
exports.getPlayersMeta = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    // جلب المراكز الفريدة
    const positions = await Player.findAll({
      where: { club_id: clubId },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('position')), 'position']],
      raw: true,
    });

    // الحالات المتاحة
    const statuses = [
      { value: 'ready', label: 'جاهز', color: 'success' },
      { value: 'injured', label: 'مصاب', color: 'danger' },
      { value: 'rehab', label: 'تأهيل', color: 'info' },
      { value: 'suspended', label: 'موقوف', color: 'warning' },
      { value: 'unknown', label: 'غير معروف', color: 'gray' },
    ];

    // المراكز
    const positionsList = positions.map(p => p.position).filter(Boolean);

    res.json({
      success: true,
      data: {
        positions: positionsList,
        statuses,
      },
    });
  } catch (error) {
    console.error('Error fetching players meta:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب البيانات الوصفية',
    });
  }
};

// ==========================================
// الحصول على تفاصيل لاعب
// ==========================================
exports.getPlayerById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const player = await Player.findOne({
      where: { id, club_id: clubId },
      include: [
        {
          model: Injury,
          as: 'injuries',
          separate: true,
          order: [['created_at', 'DESC']],
          limit: 5,
        },
        {
          model: Rehabilitation,
          as: 'rehabilitations',
          separate: true,
          where: { status: 'active' },
          required: false,
        },
        {
          model: Vital,
          as: 'vitals',
          separate: true,
          order: [['recorded_at', 'DESC']],
          limit: 1,
        },
      ],
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'اللاعب غير موجود',
      });
    }

    res.json({
      success: true,
      data: player,
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب بيانات اللاعب',
    });
  }
};

// ==========================================
// إنشاء لاعب جديد
// ==========================================
exports.createPlayer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const clubId = req.user.clubId;
    const {
      name,
      number,
      position,
      nationality,
      date_of_birth,
      height,
      weight,
      blood_type,
      dominant_foot,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
      chronic_conditions,
      surgeries_history,
      previous_injuries,
      current_medications,
      contract_start,
      contract_end,
      notes,
      custom_fields,
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name || !number || !position) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'الاسم والرقم والمركز مطلوبة',
      });
    }

    // التحقق من عدم تكرار الرقم
    const existingPlayer = await Player.findOne({
      where: { club_id: clubId, number },
      transaction,
    });

    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'رقم القميص مستخدم بالفعل',
      });
    }

    const player = await Player.create({
      club_id: clubId,
      name,
      number,
      position,
      nationality,
      date_of_birth,
      height,
      weight,
      blood_type,
      dominant_foot,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
      chronic_conditions,
      surgeries_history,
      previous_injuries,
      current_medications,
      contract_start,
      contract_end,
      notes,
      custom_fields,
      status: 'ready',
      is_active: true,
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: player,
      message: 'تم إضافة اللاعب بنجاح',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating player:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء إضافة اللاعب',
    });
  }
};

// ==========================================
// تحديث بيانات لاعب
// ==========================================
exports.updatePlayer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const updateData = req.body;

    const player = await Player.findOne({
      where: { id, club_id: clubId },
      transaction,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'اللاعب غير موجود',
      });
    }

    // التحقق من عدم تكرار الرقم
    if (updateData.number && updateData.number !== player.number) {
      const existingPlayer = await Player.findOne({
        where: {
          club_id: clubId,
          number: updateData.number,
          id: { [Op.ne]: id }
        },
        transaction,
      });

      if (existingPlayer) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'رقم القميص مستخدم بالفعل',
        });
      }
    }

    await player.update(updateData, { transaction });
    await transaction.commit();

    res.json({
      success: true,
      data: player,
      message: 'تم تحديث بيانات اللاعب بنجاح',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating player:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تحديث بيانات اللاعب',
    });
  }
};

// ==========================================
// تغيير حالة اللاعب
// ==========================================
exports.togglePlayerStatus = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { is_active } = req.body;

    const player = await Player.findOne({
      where: { id, club_id: clubId },
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'اللاعب غير موجود',
      });
    }

    await player.update({ is_active });

    res.json({
      success: true,
      data: player,
      message: is_active ? 'تم تفعيل اللاعب' : 'تم إلغاء تفعيل اللاعب',
    });
  } catch (error) {
    console.error('Error toggling player status:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تغيير حالة اللاعب',
    });
  }
};

// ==========================================
// حذف لاعب (Soft Delete)
// ==========================================
exports.deletePlayer = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const player = await Player.findOne({
      where: { id, club_id: clubId },
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'اللاعب غير موجود',
      });
    }

    // Soft delete
    await player.update({ is_active: false });

    res.json({
      success: true,
      message: 'تم حذف اللاعب بنجاح',
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء حذف اللاعب',
    });
  }
};

// ==========================================
// رفع صورة اللاعب
// ==========================================
exports.uploadPhoto = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'لم يتم اختيار ملف',
      });
    }

    const player = await Player.findOne({
      where: { id, club_id: clubId },
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'اللاعب غير موجود',
      });
    }

    const avatarUrl = `/uploads/club_${clubId}/${req.file.filename}`;
    await player.update({ avatar_url: avatarUrl });

    res.json({
      success: true,
      data: { avatar_url: avatarUrl },
      message: 'تم رفع الصورة بنجاح',
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء رفع الصورة',
    });
  }
};

// ==========================================
// الحصول على سجل اللاعب (Timeline)
// ==========================================
exports.getPlayerTimeline = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const player = await Player.findOne({
      where: { id, club_id: clubId },
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'اللاعب غير موجود',
      });
    }

    // جلب الإصابات
    const injuries = await Injury.findAll({
      where: { player_id: id, club_id: clubId },
      order: [['injury_date', 'DESC']],
      limit: parseInt(limit),
    });

    // جلب المؤشرات الحيوية
    const vitals = await Vital.findAll({
      where: { player_id: id, club_id: clubId },
      order: [['recorded_at', 'DESC']],
      limit: parseInt(limit),
    });

    // جلب برامج التأهيل
    const rehabs = await Rehabilitation.findAll({
      where: { player_id: id, club_id: clubId },
      order: [['start_date', 'DESC']],
      limit: parseInt(limit),
    });

    // دمج وترتيب الأحداث
    const timeline = [
      ...injuries.map(i => ({
        type: 'injury',
        date: i.injury_date,
        title: i.injury_type,
        description: `${i.body_area} - ${i.severity}`,
        status: i.status,
        data: i,
      })),
      ...vitals.map(v => ({
        type: 'vital',
        date: v.recorded_at,
        title: 'تسجيل مؤشرات حيوية',
        description: `HR: ${v.heart_rate}, SpO2: ${v.spo2}`,
        data: v,
      })),
      ...rehabs.map(r => ({
        type: 'rehab',
        date: r.start_date,
        title: r.program_name,
        description: `المرحلة ${r.phase} - ${r.progress_pct}%`,
        status: r.status,
        data: r,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        player,
        timeline: timeline.slice(0, parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching player timeline:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب سجل اللاعب',
    });
  }
};
