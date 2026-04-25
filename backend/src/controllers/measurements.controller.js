const { Op } = require('sequelize');
const { BodyMeasurement, Player, User, sequelize } = require('../models');
const ApiResponse = require('../utils/apiResponse');

// ==========================================
// الحصول على قائمة قياسات الجسم
// ==========================================
exports.getAllMeasurements = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      player_id = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'measured_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereCondition = { club_id: clubId };

    if (player_id) whereCondition.player_id = player_id;

    if (dateFrom) {
      whereCondition.measured_at = {
        ...whereCondition.measured_at,
        [Op.gte]: new Date(dateFrom),
      };
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.measured_at = {
        ...whereCondition.measured_at,
        [Op.lte]: endDate,
      };
    }

    const { count, rows: measurements } = await BodyMeasurement.findAndCountAll({
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
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: measurements,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب القياسات');
  }
};

// ==========================================
// الحصول على تفاصيل قياس واحد
// ==========================================
exports.getMeasurementById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const measurement = await BodyMeasurement.findOne({
      where: { id, club_id: clubId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'avatar_url'],
        }
      ],
    });

    if (!measurement) {
      return ApiResponse.notFound(res, 'القياس غير موجود');
    }

    return ApiResponse.success(res, measurement);
  } catch (error) {
    console.error('Error fetching measurement:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات القياس');
  }
};

// ==========================================
// الحصول على قياسات لاعب معين لتكوين رسم بياني
// ==========================================
exports.getPlayerMeasurements = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { playerId } = req.params;
    const { days = 180 } = req.query; // default to 6 months

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const measurements = await BodyMeasurement.findAll({
      where: {
        player_id: playerId,
        club_id: clubId,
        measured_at: { [Op.gte]: startDate },
      },
      order: [['measured_at', 'ASC']],
    });

    return res.json({
      success: true,
      data: measurements,
    });
  } catch (error) {
    console.error('Error fetching player measurements:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب قياسات اللاعب');
  }
};

// ==========================================
// إحصائيات عامة للقياسات (متوسط القيم للنادي)
// ==========================================
exports.getMeasurementsStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    
    // Recent stats logic (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const avgStats = await BodyMeasurement.findOne({
      where: {
        club_id: clubId,
        measured_at: { [Op.gte]: startDate },
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('body_fat_pct')), 'avgBodyFat'],
        [sequelize.fn('AVG', sequelize.col('muscle_mass_kg')), 'avgMuscleMass'],
        [sequelize.fn('AVG', sequelize.col('inbody_score')), 'avgInbodyScore'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalMeasurements']
      ],
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        averages: avgStats
      },
    });
  } catch (error) {
    console.error('Error fetching measurements stats:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب إحصائيات القياسات');
  }
};

// ==========================================
// إنشاء قياس جديد
// ==========================================
exports.createMeasurement = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      player_id,
      measured_at,
      weight,
      body_fat_pct,
      muscle_mass_kg,
      bone_mass_kg,
      water_pct,
      chest_cm,
      waist_cm,
      hip_cm,
      thigh_cm,
      calf_cm,
      arm_cm,
      neck_cm,
      inbody_score,
      notes,
    } = req.body;

    if (!player_id) {
      return ApiResponse.validationError(res, [], 'يجب تحديد اللاعب');
    }

    const player = await Player.findOne({ where: { id: player_id, club_id: clubId } });
    if (!player) return ApiResponse.notFound(res, 'اللاعب غير موجود');

    const measurement = await BodyMeasurement.create({
      club_id: clubId,
      player_id,
      recorded_by: req.user.userId,
      measured_at: measured_at || new Date(),
      weight,
      body_fat_pct,
      muscle_mass_kg,
      bone_mass_kg,
      water_pct,
      chest_cm,
      waist_cm,
      hip_cm,
      thigh_cm,
      calf_cm,
      arm_cm,
      neck_cm,
      inbody_score,
      notes,
    });
    
    // Update player weight if weight provided
    if (weight) {
      await player.update({ weight });
    }

    const createdMeasurement = await BodyMeasurement.findByPk(measurement.id, {
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] }]
    });

    return ApiResponse.created(res, createdMeasurement, 'تم تسجيل القياسات بنجاح');
  } catch (error) {
    console.error('Error creating measurement:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل القياسات');
  }
};

// ==========================================
// تحديث قياس
// ==========================================
exports.updateMeasurement = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    
    const measurement = await BodyMeasurement.findOne({ where: { id, club_id: clubId } });
    if (!measurement) return ApiResponse.notFound(res, 'القياس غير موجود');

    await measurement.update(req.body);

    // If weight updated, try updating player latest weight
    if (req.body.weight) {
      // Very basic approach: just update the player weight as well
      await Player.update({ weight: req.body.weight }, { where: { id: measurement.player_id }});
    }

    const updatedMeasurement = await BodyMeasurement.findByPk(id, {
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] }]
    });

    return ApiResponse.success(res, updatedMeasurement, 'تم تحديث القياس بنجاح');
  } catch (error) {
    console.error('Error updating measurement:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث القياس');
  }
};

// ==========================================
// حذف قياس
// ==========================================
exports.deleteMeasurement = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const measurement = await BodyMeasurement.findOne({ where: { id, club_id: clubId } });
    if (!measurement) return ApiResponse.notFound(res, 'القياس غير موجود');

    await measurement.destroy();
    return ApiResponse.success(res, null, 'تم حذف القياس بنجاح');
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف القياس');
  }
};
