const { Op } = require('sequelize');
const { Vital, Player, User, sequelize } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { notifyAbnormalVital } = require('../services/notification.service');

// ==========================================
// الحصول على قائمة المؤشرات الحيوية
// ==========================================
exports.getAllVitals = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      player_id = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'recorded_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = { club_id: clubId };

    if (player_id) whereCondition.player_id = player_id;

    if (dateFrom) {
      whereCondition.recorded_at = {
        ...whereCondition.recorded_at,
        [Op.gte]: new Date(dateFrom),
      };
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.recorded_at = {
        ...whereCondition.recorded_at,
        [Op.lte]: endDate,
      };
    }

    const { count, rows: vitals } = await Vital.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'avatar_url'],
        },
        {
          model: User,
          as: 'recorder',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: vitals,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب المؤشرات الحيوية');
  }
};

// ==========================================
// الحصول على آخر مؤشرات حيوية لكل لاعب (overview)
// ==========================================
exports.getVitalsOverview = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    // جلب جميع اللاعبين النشطين
    const players = await Player.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['id', 'name', 'number', 'position', 'avatar_url', 'status'],
      order: [['number', 'ASC']],
    });

    if (!players.length) {
      return res.json({ success: true, data: [] });
    }

    // لكل لاعب، نجلب آخر قياس
    const overviewData = await Promise.all(
      players.map(async (player) => {
        const latest = await Vital.findOne({
          where: { player_id: player.id, club_id: clubId },
          order: [['recorded_at', 'DESC']],
        });
        return { player: player.toJSON(), latest: latest ? latest.toJSON() : null };
      })
    );

    return res.json({ success: true, data: overviewData });
  } catch (error) {
    console.error('Error fetching vitals overview:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب نظرة عامة على المؤشرات الحيوية');
  }
};

// ==========================================
// الحصول على مؤشرات حيوية لاعب واحد (بيانات الرسوم)
// ==========================================
exports.getPlayerVitals = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { playerId } = req.params;
    const { days = 30 } = req.query;

    // التحقق من وجود اللاعب
    const player = await Player.findOne({
      where: { id: playerId, club_id: clubId },
      attributes: ['id', 'name', 'number', 'position', 'avatar_url', 'status'],
    });

    if (!player) {
      return ApiResponse.notFound(res, 'اللاعب غير موجود');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const vitals = await Vital.findAll({
      where: {
        player_id: playerId,
        club_id: clubId,
        recorded_at: { [Op.gte]: startDate },
      },
      include: [
        {
          model: User,
          as: 'recorder',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [['recorded_at', 'ASC']],
    });

    // إحصائيات ملخصة
    const stats = {};
    if (vitals.length > 0) {
      const hrValues = vitals.filter((v) => v.heart_rate).map((v) => v.heart_rate);
      const spo2Values = vitals.filter((v) => v.spo2).map((v) => v.spo2);
      const weightValues = vitals.filter((v) => v.weight).map((v) => v.weight);
      const fatigueValues = vitals.filter((v) => v.fatigue_level).map((v) => v.fatigue_level);
      const tempValues = vitals.filter((v) => v.temperature).map((v) => v.temperature);
      const sleepValues = vitals.filter((v) => v.sleep_hours).map((v) => v.sleep_hours);
      const bpSysValues = vitals.filter((v) => v.blood_pressure_systolic).map((v) => v.blood_pressure_systolic);

      const avg = (arr) =>
        arr.length > 0 ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null;

      stats.avgHeartRate = avg(hrValues);
      stats.avgSpo2 = avg(spo2Values);
      stats.avgWeight = avg(weightValues);
      stats.avgFatigue = avg(fatigueValues);
      stats.avgTemperature = avg(tempValues);
      stats.avgSleepHours = avg(sleepValues);
      stats.avgBpSystolic = avg(bpSysValues);
      stats.totalRecords = vitals.length;
      stats.latestRecord = vitals[vitals.length - 1];
    }

    return res.json({
      success: true,
      data: {
        player: player.toJSON(),
        vitals,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching player vitals:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب مؤشرات اللاعب الحيوية');
  }
};

// ==========================================
// الحصول على تفاصيل قياس واحد
// ==========================================
exports.getVitalById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const vital = await Vital.findOne({
      where: { id, club_id: clubId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'avatar_url'],
        },
        {
          model: User,
          as: 'recorder',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    });

    if (!vital) {
      return ApiResponse.notFound(res, 'القياس غير موجود');
    }

    return ApiResponse.success(res, vital);
  } catch (error) {
    console.error('Error fetching vital:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات القياس');
  }
};

// ==========================================
// إنشاء قياس حيوي جديد
// ==========================================
exports.createVital = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const {
      player_id,
      recorded_at,
      heart_rate,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      temperature,
      spo2,
      weight,
      height,
      resting_hr,
      hrv,
      sleep_hours,
      fatigue_level,
      hydration_status,
      notes,
    } = req.body;

    if (!player_id) {
      return ApiResponse.validationError(res, [], 'يجب تحديد اللاعب');
    }

    // التحقق من وجود اللاعب
    const player = await Player.findOne({
      where: { id: player_id, club_id: clubId },
    });

    if (!player) {
      return ApiResponse.notFound(res, 'اللاعب غير موجود');
    }

    // حساب BMI تلقائياً إذا توفرت البيانات
    let bmi = null;
    const w = weight || player.weight;
    const h = height || player.height;
    if (w && h) {
      bmi = parseFloat((w / ((h / 100) ** 2)).toFixed(1));
    }

    const vital = await Vital.create({
      club_id: clubId,
      player_id,
      recorded_by: userId,
      recorded_at: recorded_at || new Date(),
      heart_rate: heart_rate || null,
      blood_pressure_systolic: blood_pressure_systolic || null,
      blood_pressure_diastolic: blood_pressure_diastolic || null,
      temperature: temperature || null,
      spo2: spo2 || null,
      weight: weight || null,
      height: height || null,
      bmi,
      resting_hr: resting_hr || null,
      hrv: hrv || null,
      sleep_hours: sleep_hours || null,
      fatigue_level: fatigue_level || null,
      hydration_status: hydration_status || null,
      notes: notes || null,
    });

    // جلب القياس الكامل مع العلاقات
    const fullVital = await Vital.findByPk(vital.id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'recorder', attributes: ['id', 'name'], required: false },
      ],
    });

    // إشعار عند قراءات غير طبيعية
    const abnormalities = [];
    if (heart_rate && (heart_rate > 100 || heart_rate < 50)) abnormalities.push(`نبض القلب: ${heart_rate}`);
    if (spo2 && spo2 < 95) abnormalities.push(`تشبع الأكسجين: ${spo2}%`);
    if (blood_pressure_systolic && blood_pressure_systolic > 140) abnormalities.push(`ضغط الدم: ${blood_pressure_systolic}/${blood_pressure_diastolic}`);
    if (abnormalities.length > 0) {
      notifyAbnormalVital(clubId, player.name, abnormalities.join(', '), vital.id).catch(() => {});
    }

    return ApiResponse.created(res, fullVital, 'تم تسجيل المؤشرات الحيوية بنجاح');
  } catch (error) {
    console.error('Error creating vital:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل المؤشرات الحيوية');
  }
};

// ==========================================
// إنشاء قياسات جماعية (لأكثر من لاعب دفعة واحدة)
// ==========================================
exports.createBulkVitals = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const { vitals: vitalsData, recorded_at } = req.body;

    if (!vitalsData || !Array.isArray(vitalsData) || vitalsData.length === 0) {
      return ApiResponse.validationError(res, [], 'قائمة القياسات فارغة');
    }

    const createdVitals = [];
    for (const vitalInput of vitalsData) {
      const { player_id, ...rest } = vitalInput;
      if (!player_id) continue;

      const player = await Player.findOne({
        where: { id: player_id, club_id: clubId },
        transaction,
      });
      if (!player) continue;

      const w = rest.weight || player.weight;
      const h = rest.height || player.height;
      const bmi = w && h ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : null;

      const vital = await Vital.create(
        {
          club_id: clubId,
          player_id,
          recorded_by: userId,
          recorded_at: recorded_at || new Date(),
          ...rest,
          bmi,
        },
        { transaction }
      );
      createdVitals.push(vital);
    }

    await transaction.commit();
    return ApiResponse.created(res, createdVitals, `تم تسجيل ${createdVitals.length} قياس بنجاح`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating bulk vitals:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل القياسات الجماعية');
  }
};

// ==========================================
// تحديث قياس
// ==========================================
exports.updateVital = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const updateData = { ...req.body };

    const vital = await Vital.findOne({ where: { id, club_id: clubId } });

    if (!vital) {
      return ApiResponse.notFound(res, 'القياس غير موجود');
    }

    // إعادة حساب BMI إذا تغير الوزن أو الطول
    if (updateData.weight || updateData.height) {
      const w = updateData.weight || vital.weight;
      const h = updateData.height || vital.height;
      if (w && h) {
        updateData.bmi = parseFloat((w / ((h / 100) ** 2)).toFixed(1));
      }
    }

    await vital.update(updateData);

    const updatedVital = await Vital.findByPk(id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'recorder', attributes: ['id', 'name'], required: false },
      ],
    });

    return ApiResponse.success(res, updatedVital, 'تم تحديث القياس بنجاح');
  } catch (error) {
    console.error('Error updating vital:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث القياس');
  }
};

// ==========================================
// حذف قياس
// ==========================================
exports.deleteVital = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const vital = await Vital.findOne({ where: { id, club_id: clubId } });

    if (!vital) {
      return ApiResponse.notFound(res, 'القياس غير موجود');
    }

    await vital.destroy();
    return ApiResponse.success(res, null, 'تم حذف القياس بنجاح');
  } catch (error) {
    console.error('Error deleting vital:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف القياس');
  }
};

// ==========================================
// إحصائيات المؤشرات الحيوية للنادي
// ==========================================
exports.getVitalsStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // متوسط المؤشرات على مستوى النادي
    const avgStats = await Vital.findOne({
      where: {
        club_id: clubId,
        recorded_at: { [Op.gte]: startDate },
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('heart_rate')), 'avgHeartRate'],
        [sequelize.fn('AVG', sequelize.col('spo2')), 'avgSpo2'],
        [sequelize.fn('AVG', sequelize.col('weight')), 'avgWeight'],
        [sequelize.fn('AVG', sequelize.col('fatigue_level')), 'avgFatigue'],
        [sequelize.fn('AVG', sequelize.col('sleep_hours')), 'avgSleepHours'],
        [sequelize.fn('AVG', sequelize.col('temperature')), 'avgTemperature'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords'],
      ],
      raw: true,
    });

    // عدد اللاعبين الذين تم قياسهم
    const measuredPlayers = await Vital.findAll({
      where: {
        club_id: clubId,
        recorded_at: { [Op.gte]: startDate },
      },
      attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('player_id'))), 'count']],
      raw: true,
    });

    // القياسات المنبهة (القيم غير الطبيعية)
    const alertCounts = {
      highHeartRate: await Vital.count({
        where: { club_id: clubId, heart_rate: { [Op.gt]: 100 }, recorded_at: { [Op.gte]: startDate } },
      }),
      lowSpo2: await Vital.count({
        where: { club_id: clubId, spo2: { [Op.lt]: 95 }, recorded_at: { [Op.gte]: startDate } },
      }),
      highBp: await Vital.count({
        where: {
          club_id: clubId,
          blood_pressure_systolic: { [Op.gt]: 140 },
          recorded_at: { [Op.gte]: startDate },
        },
      }),
      highFatigue: await Vital.count({
        where: { club_id: clubId, fatigue_level: { [Op.gte]: 8 }, recorded_at: { [Op.gte]: startDate } },
      }),
    };

    // اتجاه متوسط معدل القلب - آخر 7 أيام
    const hrTrend = await Vital.findAll({
      where: {
        club_id: clubId,
        heart_rate: { [Op.ne]: null },
        recorded_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('recorded_at')), 'date'],
        [sequelize.fn('AVG', sequelize.col('heart_rate')), 'avgHr'],
        [sequelize.fn('AVG', sequelize.col('spo2')), 'avgSpo2'],
        [sequelize.fn('AVG', sequelize.col('fatigue_level')), 'avgFatigue'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('recorded_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('recorded_at')), 'ASC']],
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        averages: avgStats,
        measuredPlayersCount: parseInt(measuredPlayers[0]?.count || 0),
        alerts: alertCounts,
        hrTrend,
      },
    });
  } catch (error) {
    console.error('Error fetching vitals stats:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب إحصائيات المؤشرات الحيوية');
  }
};
