const { Op } = require('sequelize');
const dayjs = require('dayjs');
const {
  Player,
  Injury,
  Vital,
  Rehabilitation,
  RehabSession,
  FileRecord,
  User,
  Club,
  Appointment,
  Performance,
  Equipment,
  EquipmentMaintenance,
  Supply,
  SupplyTransaction,
  BodyMeasurement,
  sequelize,
} = require('../models');
const ApiResponse = require('../utils/apiResponse');

// ==========================================
// بيانات التقرير: ملخص الفريق
// ==========================================
exports.getTeamHealthReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { dateFrom, dateTo } = req.query;

    const club = await Club.findByPk(clubId, { attributes: ['id', 'name', 'name_en', 'logo_url'] });

    const players = await Player.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['id', 'name', 'number', 'position', 'status', 'date_of_birth', 'nationality'],
      order: [['number', 'ASC']],
    });

    const injuryWhere = { club_id: clubId };
    if (dateFrom) injuryWhere.injury_date = { ...injuryWhere.injury_date, [Op.gte]: dateFrom };
    if (dateTo) injuryWhere.injury_date = { ...injuryWhere.injury_date, [Op.lte]: dateTo };

    const injuries = await Injury.findAll({
      where: injuryWhere,
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'number'] }],
      order: [['injury_date', 'DESC']],
    });

    const activeRehabs = await Rehabilitation.findAll({
      where: { club_id: clubId, status: 'active' },
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'number'] }],
    });

    const statusCounts = players.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const healthIndex = players.length > 0
      ? Math.round((statusCounts.ready || 0) / players.length * 100)
      : 0;

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        summary: {
          totalPlayers: players.length,
          ready: statusCounts.ready || 0,
          injured: statusCounts.injured || 0,
          rehab: statusCounts.rehab || 0,
          suspended: statusCounts.suspended || 0,
          healthIndex,
          totalInjuries: injuries.length,
          activeRehabs: activeRehabs.length,
        },
        players,
        injuries,
        activeRehabs,
      },
    });
  } catch (error) {
    console.error('Error generating team health report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء التقرير');
  }
};

// ==========================================
// بيانات التقرير: ملف لاعب
// ==========================================
exports.getPlayerReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { player_id } = req.params;

    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const player = await Player.findOne({
      where: { id: player_id, club_id: clubId },
    });
    if (!player) return ApiResponse.notFound(res, 'اللاعب غير موجود');

    const injuries = await Injury.findAll({
      where: { player_id, club_id: clubId },
      include: [{ model: User, as: 'treatingDoctor', attributes: ['id', 'name'] }],
      order: [['injury_date', 'DESC']],
    });

    const vitals = await Vital.findAll({
      where: { player_id, club_id: clubId },
      order: [['recorded_at', 'DESC']],
      limit: 10,
    });

    const rehabPrograms = await Rehabilitation.findAll({
      where: { player_id, club_id: clubId },
      include: [{ model: User, as: 'therapist', attributes: ['id', 'name'], required: false }],
      order: [['start_date', 'DESC']],
    });

    const files = await FileRecord.findAll({
      where: { player_id, club_id: clubId },
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    return res.json({
      success: true,
      data: {
        club,
        player,
        generatedAt: new Date().toISOString(),
        injuries,
        vitals,
        rehabPrograms,
        files,
        summary: {
          totalInjuries: injuries.length,
          activeInjuries: injuries.filter((i) => i.status === 'active').length,
          totalRehab: rehabPrograms.length,
          completedRehab: rehabPrograms.filter((r) => r.status === 'completed').length,
          totalFiles: files.length,
          latestVitals: vitals[0] || null,
        },
      },
    });
  } catch (error) {
    console.error('Error generating player report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير اللاعب');
  }
};

// ==========================================
// بيانات التقرير: الإصابات
// ==========================================
exports.getInjuryReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { dateFrom, dateTo, severity, status } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (dateFrom) where.injury_date = { ...where.injury_date, [Op.gte]: dateFrom };
    if (dateTo) where.injury_date = { ...where.injury_date, [Op.lte]: dateTo };
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const injuries = await Injury.findAll({
      where,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'treatingDoctor', attributes: ['id', 'name'] },
      ],
      order: [['injury_date', 'DESC']],
    });

    const severityCounts = injuries.reduce((acc, inj) => {
      acc[inj.severity] = (acc[inj.severity] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = injuries.reduce((acc, inj) => {
      acc[inj.status] = (acc[inj.status] || 0) + 1;
      return acc;
    }, {});

    const avgRecovery = injuries.filter((i) => i.actual_recovery_days).reduce((sum, i, _, arr) => {
      return sum + i.actual_recovery_days / arr.length;
    }, 0);

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        summary: {
          total: injuries.length,
          bySeverity: severityCounts,
          byStatus: statusCounts,
          avgRecoveryDays: Math.round(avgRecovery),
        },
        injuries,
      },
    });
  } catch (error) {
    console.error('Error generating injury report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير الإصابات');
  }
};

// ==========================================
// بيانات التقرير: التأهيل
// ==========================================
exports.getRehabReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { status } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (status) where.status = status;

    const programs = await Rehabilitation.findAll({
      where,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'therapist', attributes: ['id', 'name'], required: false },
        {
          model: RehabSession,
          as: 'sessions',
          attributes: ['id', 'attendance', 'pain_level', 'session_date'],
          required: false,
        },
      ],
      order: [['start_date', 'DESC']],
    });

    const withStats = programs.map((prog) => {
      const sessions = prog.sessions || [];
      const attended = sessions.filter((s) => s.attendance === 'attended').length;
      const missed = sessions.filter((s) => s.attendance === 'missed').length;
      const avgPain = sessions.filter((s) => s.pain_level !== null).length > 0
        ? (sessions.reduce((sum, s) => sum + (s.pain_level || 0), 0) / sessions.length).toFixed(1)
        : null;

      return {
        ...prog.toJSON(),
        sessionStats: { total: sessions.length, attended, missed, avgPain },
      };
    });

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        summary: {
          total: programs.length,
          active: programs.filter((p) => p.status === 'active').length,
          completed: programs.filter((p) => p.status === 'completed').length,
          paused: programs.filter((p) => p.status === 'paused').length,
        },
        programs: withStats,
      },
    });
  } catch (error) {
    console.error('Error generating rehab report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير التأهيل');
  }
};

// ==========================================
// بيانات التقرير: المؤشرات الحيوية
// ==========================================
exports.getVitalsReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { player_id, dateFrom, dateTo } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (player_id) where.player_id = player_id;
    if (dateFrom) where.recorded_at = { ...where.recorded_at, [Op.gte]: dateFrom };
    if (dateTo) where.recorded_at = { ...where.recorded_at, [Op.lte]: dateTo };

    const vitals = await Vital.findAll({
      where,
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] }],
      order: [['recorded_at', 'DESC']],
    });

    const avgHR = vitals.filter((v) => v.heart_rate).reduce((s, v, _, a) => s + v.heart_rate / a.length, 0);
    const avgSpo2 = vitals.filter((v) => v.spo2).reduce((s, v, _, a) => s + v.spo2 / a.length, 0);
    const avgWeight = vitals.filter((v) => v.weight).reduce((s, v, _, a) => s + v.weight / a.length, 0);
    const abnormalCount = vitals.filter((v) => v.heart_rate > 100 || v.spo2 < 95 || v.temperature > 38).length;

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        summary: {
          total: vitals.length,
          abnormalCount,
          avgHeartRate: Math.round(avgHR),
          avgSpO2: avgSpo2.toFixed(1),
          avgWeight: avgWeight.toFixed(1),
        },
        vitals,
      },
    });
  } catch (error) {
    console.error('Error generating vitals report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير المؤشرات الحيوية');
  }
};

// ==========================================
// الحصول على قائمة اللاعبين (للاختيار في التقرير)
// ==========================================
exports.getReportPlayers = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const players = await Player.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['id', 'name', 'number', 'position', 'status', 'avatar_url'],
      order: [['number', 'ASC']],
    });
    return ApiResponse.success(res, players);
  } catch (error) {
    return ApiResponse.error(res, 'حدث خطأ');
  }
};

// ==========================================
// بيانات التقرير: المواعيد
// ==========================================
exports.getAppointmentsReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { dateFrom, dateTo, status, doctor_id } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (dateFrom) where.scheduled_date = { ...where.scheduled_date, [Op.gte]: dateFrom };
    if (dateTo) where.scheduled_date = { ...where.scheduled_date, [Op.lte]: dateTo };
    if (status) where.status = status;
    if (doctor_id) where.doctor_id = doctor_id;

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'], required: false },
      ],
      order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']],
    });

    const statusCounts = appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        summary: {
          total: appointments.length,
          scheduled: statusCounts.scheduled || 0,
          completed: statusCounts.completed || 0,
          cancelled: statusCounts.cancelled || 0,
          no_show: statusCounts.no_show || 0,
        },
        appointments,
      },
    });
  } catch (error) {
    console.error('Error generating appointments report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير المواعيد');
  }
};

// ==========================================
// بيانات التقرير: تقييم الأداء
// ==========================================
exports.getPerformanceReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { player_id, dateFrom, dateTo } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (player_id) where.player_id = player_id;
    if (dateFrom) where.evaluation_date = { ...where.evaluation_date, [Op.gte]: dateFrom };
    if (dateTo) where.evaluation_date = { ...where.evaluation_date, [Op.lte]: dateTo };

    const performances = await Performance.findAll({
      where,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'evaluator', attributes: ['id', 'name'], required: false },
      ],
      order: [['evaluation_date', 'DESC']],
    });

    const avgScore = performances.filter((p) => p.overall_score_pct).length > 0
      ? Math.round(performances.reduce((s, p) => s + (p.overall_score_pct || 0), 0) / performances.length)
      : 0;

    const avgReadiness = performances.filter((p) => p.physical_readiness_pct).length > 0
      ? Math.round(performances.reduce((s, p) => s + (p.physical_readiness_pct || 0), 0) / performances.length)
      : 0;

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        summary: {
          total: performances.length,
          avgOverallScore: avgScore,
          avgReadiness,
          trendUp: performances.filter((p) => p.trend === 'up').length,
          trendDown: performances.filter((p) => p.trend === 'down').length,
        },
        performances,
      },
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير الأداء');
  }
};

// ==========================================
// بيانات التقرير: المعدات والصيانة
// ==========================================
exports.getEquipmentReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { status } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (status) where.status = status;

    const equipment = await Equipment.findAll({
      where,
      include: [
        {
          model: EquipmentMaintenance,
          as: 'maintenanceRecords',
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });

    const statusCounts = equipment.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

    const maintenanceDueSoon = equipment.filter(
      (e) => e.next_maintenance_date && dayjs(e.next_maintenance_date).isBefore(dayjs().add(30, 'day'))
    ).length;

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        summary: {
          total: equipment.length,
          excellent: statusCounts.excellent || 0,
          good: statusCounts.good || 0,
          needs_maintenance: statusCounts.needs_maintenance || 0,
          out_of_service: statusCounts.out_of_service || 0,
          maintenanceDueSoon,
        },
        equipment,
      },
    });
  } catch (error) {
    console.error('Error generating equipment report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير المعدات');
  }
};

// ==========================================
// بيانات التقرير: المستلزمات والمخزون
// ==========================================
exports.getSuppliesReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { category } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (category) where.category = category;

    const supplies = await Supply.findAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    const now = dayjs();
    const categoryCounts = supplies.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});

    const lowStock = supplies.filter((s) => s.total_quantity <= (s.reorder_level || 10)).length;
    const expiringSoon = supplies.filter(
      (s) => s.expiry_date && dayjs(s.expiry_date).isBefore(now.add(60, 'day')) && dayjs(s.expiry_date).isAfter(now)
    ).length;
    const expired = supplies.filter((s) => s.expiry_date && dayjs(s.expiry_date).isBefore(now)).length;

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        summary: {
          total: supplies.length,
          lowStock,
          expiringSoon,
          expired,
          byCategory: categoryCounts,
        },
        supplies,
      },
    });
  } catch (error) {
    console.error('Error generating supplies report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير المستلزمات');
  }
};

// ==========================================
// بيانات التقرير: قياسات الجسم
// ==========================================
exports.getMeasurementsReport = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { player_id, dateFrom, dateTo } = req.query;
    const club = await Club.findByPk(clubId, { attributes: ['id', 'name'] });

    const where = { club_id: clubId };
    if (player_id) where.player_id = player_id;
    if (dateFrom) where.measured_at = { ...where.measured_at, [Op.gte]: dateFrom };
    if (dateTo) where.measured_at = { ...where.measured_at, [Op.lte]: dateTo };

    const measurements = await BodyMeasurement.findAll({
      where,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
      ],
      order: [['measured_at', 'DESC']],
    });

    const avgWeight = measurements.filter((m) => m.weight).length > 0
      ? (measurements.reduce((s, m) => s + (m.weight || 0), 0) / measurements.filter((m) => m.weight).length).toFixed(1)
      : null;
    const avgBodyFat = measurements.filter((m) => m.body_fat_pct).length > 0
      ? (measurements.reduce((s, m) => s + (m.body_fat_pct || 0), 0) / measurements.filter((m) => m.body_fat_pct).length).toFixed(1)
      : null;

    return res.json({
      success: true,
      data: {
        club,
        generatedAt: new Date().toISOString(),
        dateRange: { from: dateFrom, to: dateTo },
        summary: {
          total: measurements.length,
          avgWeight,
          avgBodyFat,
        },
        measurements,
      },
    });
  } catch (error) {
    console.error('Error generating measurements report:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إنشاء تقرير القياسات');
  }
};
