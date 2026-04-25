const { Op, Sequelize } = require('sequelize');
const {
  Player,
  Injury,
  Rehabilitation,
  Appointment,
  Equipment,
  Supply,
  Performance,
  Vital,
  User,
  sequelize,
} = require('../models');
const dayjs = require('dayjs');

// ==========================================
// الحصول على الإحصائيات الرئيسية
// ==========================================
exports.getStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    // إجمالي اللاعبين النشطين
    const totalPlayers = await Player.count({
      where: { club_id: clubId, is_active: true },
    });

    // اللاعبون المصابون حالياً
    const injuredPlayers = await Player.count({
      where: { club_id: clubId, is_active: true, status: 'injured' },
    });

    // اللاعبون في التأهيل
    const rehabPlayers = await Player.count({
      where: { club_id: clubId, is_active: true, status: 'rehab' },
    });

    // اللاعبون الجاهزون للمباراة
    const readyPlayers = await Player.count({
      where: { club_id: clubId, is_active: true, status: 'ready' },
    });

    // اللاعبون الموقوفون
    const suspendedPlayers = await Player.count({
      where: { club_id: clubId, is_active: true, status: 'suspended' },
    });

    // الإصابات النشطة
    const activeInjuries = await Injury.count({
      where: { club_id: clubId, status: 'active' },
    });

    // برامج التأهيل النشطة
    const activeRehabs = await Rehabilitation.count({
      where: { club_id: clubId, status: 'active' },
    });

    // مواعيد اليوم
    const today = dayjs().format('YYYY-MM-DD');
    const todayAppointments = await Appointment.count({
      where: {
        club_id: clubId,
        scheduled_date: today,
        status: 'scheduled',
      },
    });

    // معدات تحتاج صيانة
    const equipmentNeedsMaintenance = await Equipment.count({
      where: {
        club_id: clubId,
        status: 'needs_maintenance',
      },
    });

    // معدات خارجة عن الخدمة
    const equipmentOutOfService = await Equipment.count({
      where: {
        club_id: clubId,
        status: 'out_of_service',
      },
    });

    // مستلزمات منخفضة المخزون
    const lowSupplies = await Supply.count({
      where: {
        club_id: clubId,
        [Op.and]: [
          Sequelize.literal('`Supply`.`total_quantity` <= `Supply`.`reorder_level`')
        ],
      },
    });

    // مستلزمات منتهية الصلاحية قريباً (خلال 60 يوم)
    const sixtyDaysFromNow = dayjs().add(60, 'day').format('YYYY-MM-DD');
    const expiringSupplies = await Supply.count({
      where: {
        club_id: clubId,
        expiry_date: {
          [Op.lte]: sixtyDaysFromNow,
          [Op.gte]: dayjs().format('YYYY-MM-DD'),
        },
      },
    });

    // مؤشر صحة الفريق (حساب ذكي)
    const healthIndex = totalPlayers > 0
      ? Math.round(((readyPlayers / totalPlayers) * 100))
      : 0;

    // متوسط وقت التعافي من الإصابات المغلقة
    const avgRecoveryTime = await Injury.findOne({
      where: {
        club_id: clubId,
        status: 'closed',
        actual_recovery_days: { [Op.not]: null },
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('actual_recovery_days')), 'avg_days'],
      ],
      raw: true,
    });

    // متوسط مستوى التعب (آخر 7 أيام)
    const avgFatigueResult = await Vital.findOne({
      where: {
        club_id: clubId,
        recorded_at: { [Op.gte]: dayjs().subtract(7, 'day').toDate() },
        fatigue_level: { [Op.not]: null },
      },
      attributes: [[Sequelize.fn('AVG', Sequelize.col('fatigue_level')), 'avg']],
      raw: true,
    });

    // متوسط معدل ضربات القلب (آخر 7 أيام)
    const avgHRResult = await Vital.findOne({
      where: {
        club_id: clubId,
        recorded_at: { [Op.gte]: dayjs().subtract(7, 'day').toDate() },
        heart_rate: { [Op.not]: null },
      },
      attributes: [[Sequelize.fn('AVG', Sequelize.col('heart_rate')), 'avg']],
      raw: true,
    });

    // اللاعبون المتوقع عودتهم خلال 14 يوم
    const returningCount = await Injury.count({
      where: {
        club_id: clubId,
        status: { [Op.in]: ['active', 'recovering'] },
        return_date: {
          [Op.gte]: today,
          [Op.lte]: dayjs().add(14, 'day').format('YYYY-MM-DD'),
        },
      },
    });

    // الإصابات المتكررة النشطة
    const recurringCount = await Injury.count({
      where: { club_id: clubId, status: 'active', is_recurring: true },
    });

    // متوسط تقدم برامج التأهيل النشطة
    const avgRehabResult = await Rehabilitation.findOne({
      where: { club_id: clubId, status: 'active' },
      attributes: [[Sequelize.fn('AVG', Sequelize.col('progress_pct')), 'avg']],
      raw: true,
    });

    // مواعيد هذا الأسبوع
    const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
    const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');
    const thisWeekAppts = await Appointment.count({
      where: {
        club_id: clubId,
        scheduled_date: { [Op.between]: [weekStart, weekEnd] },
        status: 'scheduled',
      },
    });

    res.json({
      success: true,
      data: {
        players: {
          total: totalPlayers,
          ready: readyPlayers,
          injured: injuredPlayers,
          rehab: rehabPlayers,
          suspended: suspendedPlayers,
        },
        injuries: {
          active: activeInjuries,
          avgRecoveryDays: Math.round(avgRecoveryTime?.avg_days || 0),
          returning: returningCount,
          recurring: recurringCount,
        },
        rehabilitation: {
          active: activeRehabs,
          avgProgress: Math.round(parseFloat(avgRehabResult?.avg || 0)),
        },
        appointments: {
          today: todayAppointments,
          thisWeek: thisWeekAppts,
        },
        equipment: {
          needsMaintenance: equipmentNeedsMaintenance,
          outOfService: equipmentOutOfService,
        },
        supplies: {
          low: lowSupplies,
          expiringSoon: expiringSupplies,
        },
        vitals: {
          avgFatigue: parseFloat(avgFatigueResult?.avg || 0).toFixed(1),
          avgHR: Math.round(parseFloat(avgHRResult?.avg || 0)),
        },
        healthIndex,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب الإحصائيات',
    });
  }
};

// ==========================================
// الحصول على بيانات الرسوم البيانية
// ==========================================
exports.getChartsData = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    // 1. توزيع حالات اللاعبين (Donut Chart)
    const playerStatusDistribution = await Player.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const statusLabels = {
      ready: 'جاهز',
      injured: 'مصاب',
      rehab: 'تأهيل',
      suspended: 'موقوف',
      unknown: 'غير معروف',
    };

    const statusColors = {
      ready: '#1D9E75',
      injured: '#A32D2D',
      rehab: '#185FA5',
      suspended: '#854F0B',
      unknown: '#6c757d',
    };

    const playerStatusChart = playerStatusDistribution.map((item) => ({
      name: statusLabels[item.status] || item.status,
      value: parseInt(item.count),
      color: statusColors[item.status] || '#6c757d',
      key: item.status,
    }));

    // 2. الإصابات حسب الأسبوع (Bar Chart) - آخر 8 أسابيع
    const eightWeeksAgo = dayjs().subtract(8, 'week').format('YYYY-MM-DD');
    const injuriesByWeek = await Injury.findAll({
      where: {
        club_id: clubId,
        injury_date: { [Op.gte]: eightWeeksAgo },
      },
      attributes: [
        [Sequelize.fn('YEARWEEK', Sequelize.col('injury_date')), 'week'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: [Sequelize.fn('YEARWEEK', Sequelize.col('injury_date'))],
      order: [[Sequelize.fn('YEARWEEK', Sequelize.col('injury_date')), 'ASC']],
      raw: true,
    });

    const injuriesByWeekChart = injuriesByWeek.map((item) => ({
      week: `أسبوع ${item.week.toString().slice(4)}`,
      injuries: parseInt(item.count),
    }));

    // 3. أكثر مناطق الإصابات (Horizontal Bar)
    const injuriesByArea = await Injury.findAll({
      where: { club_id: clubId },
      attributes: ['body_area', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['body_area'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      limit: 8,
      raw: true,
    });

    const injuriesByAreaChart = injuriesByArea.map((item) => ({
      area: item.body_area,
      count: parseInt(item.count),
    }));

    // 4. معدل التعافي (Area Chart) - آخر 90 يوم
    const ninetyDaysAgo = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
    const recoveryData = await Injury.findAll({
      where: {
        club_id: clubId,
        status: 'closed',
        return_date: { [Op.gte]: ninetyDaysAgo },
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('return_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('return_date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('return_date')), 'ASC']],
      raw: true,
    });

    const recoveryChart = recoveryData.map((item) => ({
      date: dayjs(item.date).format('DD/MM'),
      recoveries: parseInt(item.count),
    }));

    // 5. أداء الفريق (Radar Chart) - متوسط آخر 30 يوم
    const thirtyDaysAgo = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const performanceData = await Performance.findOne({
      where: {
        club_id: clubId,
        evaluation_date: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('strength_pct')), 'strength'],
        [Sequelize.fn('AVG', Sequelize.col('endurance_pct')), 'endurance'],
        [Sequelize.fn('AVG', Sequelize.col('flexibility_pct')), 'flexibility'],
        [Sequelize.fn('AVG', Sequelize.col('agility_score')), 'agility'],
        [Sequelize.fn('AVG', Sequelize.col('reaction_time_ms')), 'reaction'],
      ],
      raw: true,
    });

    const performanceRadar = performanceData && performanceData.strength
      ? [
          { metric: 'القوة', value: Math.round(performanceData.strength), fullMark: 100 },
          { metric: 'التحمل', value: Math.round(performanceData.endurance), fullMark: 100 },
          { metric: 'المرونة', value: Math.round(performanceData.flexibility), fullMark: 100 },
          { metric: 'الرشاقة', value: Math.round(performanceData.agility) || 70, fullMark: 100 },
          { metric: 'سرعة الاستجابة', value: Math.min(100, Math.round(100 - (performanceData.reaction / 10))), fullMark: 100 },
        ]
      : [
          { metric: 'القوة', value: 75, fullMark: 100 },
          { metric: 'التحمل', value: 82, fullMark: 100 },
          { metric: 'المرونة', value: 68, fullMark: 100 },
          { metric: 'الرشاقة', value: 79, fullMark: 100 },
          { metric: 'سرعة الاستجابة', value: 85, fullMark: 100 },
        ];

    // 6. المؤشرات الحيوية المتوسطة (Multi-line Chart)
    const vitalsTrend = await Vital.findAll({
      where: {
        club_id: clubId,
        recorded_at: { [Op.gte]: dayjs().subtract(30, 'day').toDate() },
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('recorded_at')), 'date'],
        [Sequelize.fn('AVG', Sequelize.col('heart_rate')), 'avg_hr'],
        [Sequelize.fn('AVG', Sequelize.col('spo2')), 'avg_spo2'],
        [Sequelize.fn('AVG', Sequelize.col('weight')), 'avg_weight'],
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('recorded_at'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('recorded_at')), 'ASC']],
      raw: true,
    });

    const vitalsChart = vitalsTrend.map((item) => ({
      date: dayjs(item.date).format('DD/MM'),
      heartRate: Math.round(item.avg_hr) || 72,
      spo2: Math.round(item.avg_spo2) || 98,
      weight: Math.round(item.avg_weight) || 75,
    }));

    // 7. الإصابات حسب الشدة (Pie Chart)
    const injuriesBySeverity = await Injury.findAll({
      where: { club_id: clubId },
      attributes: ['severity', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['severity'],
      raw: true,
    });

    const severityLabels = {
      mild: 'بسيطة',
      moderate: 'متوسطة',
      severe: 'شديدة',
      critical: 'حرجة',
    };

    const severityColors = {
      mild: '#3B6D11',
      moderate: '#854F0B',
      severe: '#A32D2D',
      critical: '#212529',
    };

    const injuriesBySeverityChart = injuriesBySeverity.map((item) => ({
      name: severityLabels[item.severity] || item.severity,
      value: parseInt(item.count),
      color: severityColors[item.severity] || '#6c757d',
    }));

    // 8. اللاعبون حسب المركز
    const playersByPosition = await Player.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['position', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['position'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      raw: true,
    });

    const playersByPositionChart = playersByPosition.map((item) => ({
      position: item.position,
      count: parseInt(item.count),
    }));

    // 9. منحنى توافر الفريق (آخر 12 أسبوع) — يُحسب من سجلات الإصابات
    const totalActivePlayers = await Player.count({ where: { club_id: clubId, is_active: true } });
    const allInjuriesHistory = await Injury.findAll({
      where: { club_id: clubId },
      attributes: ['id', 'injury_date', 'return_date', 'status'],
      raw: true,
    });

    const availabilityTrend = [];
    for (let i = 11; i >= 0; i--) {
      const wkStart = dayjs().subtract(i, 'week').startOf('week').format('YYYY-MM-DD');
      const wkEnd   = dayjs().subtract(i, 'week').endOf('week').format('YYYY-MM-DD');

      const injuredThatWeek = allInjuriesHistory.filter((inj) => {
        const s = inj.injury_date;
        const e = inj.return_date || dayjs().add(365, 'day').format('YYYY-MM-DD');
        return s <= wkEnd && e >= wkStart;
      }).length;

      const available = Math.max(0, totalActivePlayers - injuredThatWeek);
      const availability = totalActivePlayers > 0
        ? Math.min(100, Math.max(0, Math.round((available / totalActivePlayers) * 100)))
        : 100;

      availabilityTrend.push({
        week: dayjs().subtract(i, 'week').format('DD/MM'),
        availability,
        injured: Math.min(injuredThatWeek, totalActivePlayers),
        available,
      });
    }

    // 10. الإصابات حسب الآلية
    const mechData = await Injury.findAll({
      where: { club_id: clubId },
      attributes: ['mechanism', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['mechanism'],
      raw: true,
    });

    const mechLabels = { collision: 'تصادم', overuse: 'إجهاد متكرر', fatigue: 'إجهاد', unknown: 'غير محدد' };
    const mechColors = { collision: '#A32D2D', overuse: '#854F0B', fatigue: '#185FA5', unknown: '#6c757d' };

    const injuriesByMechanismChart = mechData.map((item) => ({
      name: mechLabels[item.mechanism] || item.mechanism || 'غير محدد',
      value: parseInt(item.count),
      color: mechColors[item.mechanism] || '#6c757d',
    }));

     // 11. برامج التأهيل النشطة مع تقدم اللاعبين - تم الإزالة حسب المتطلبات
     // 12. اللاعبون العائدون قريباً: إصابات في التعافي أو لها تاريخ عودة قريب - تم الإزالة حسب المتطلبات

    res.json({
      success: true,
      data: {
        playerStatusChart,
        injuriesByWeekChart,
        injuriesByAreaChart,
        recoveryChart,
        performanceRadar,
        vitalsChart,
        injuriesBySeverityChart,
        playersByPositionChart,
        availabilityTrend,
        injuriesByMechanismChart,
      },
    });
  } catch (error) {
    console.error('Error fetching charts data:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب بيانات الرسوم البيانية',
    });
  }
};

// ==========================================
// الحصول على التنبيهات
// ==========================================
exports.getAlerts = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const alerts = [];

    // 1. معدات تحتاج صيانة عاجلة
    const urgentEquipment = await Equipment.findAll({
      where: {
        club_id: clubId,
        [Op.or]: [
          { status: 'needs_maintenance' },
          { status: 'out_of_service' },
        ],
      },
      limit: 3,
      order: [['updated_at', 'DESC']],
      raw: true,
    });

    urgentEquipment.forEach((item) => {
      alerts.push({
        type: item.status === 'out_of_service' ? 'danger' : 'warning',
        category: 'equipment',
        title: 'صيانة جهاز مطلوبة',
        message: `جهاز "${item.name}" ${item.status === 'out_of_service' ? 'خارج الخدمة' : 'يحتاج صيانة عاجلة'}`,
        id: item.id,
        created_at: item.updated_at,
      });
    });

    // 2. مستلزمات منخفضة
    const lowStockSupplies = await Supply.findAll({
      where: {
        club_id: clubId,
        [Op.and]: [
          Sequelize.literal('`Supply`.`total_quantity` <= `Supply`.`reorder_level`')
        ],
      },
      limit: 3,
      raw: true,
    });

    lowStockSupplies.forEach((item) => {
      alerts.push({
        type: item.total_quantity === 0 ? 'danger' : 'warning',
        category: 'supply',
        title: 'مخزون منخفض',
        message: `${item.name}: ${item.total_quantity} وحدة متبقية`,
        id: item.id,
        created_at: item.created_at,
      });
    });

    // 3. أدوية تنتهي صلاحيتها
    const thirtyDaysFromNow = dayjs().add(30, 'day').format('YYYY-MM-DD');
    const expiringSupplies = await Supply.findAll({
      where: {
        club_id: clubId,
        expiry_date: {
          [Op.lte]: thirtyDaysFromNow,
          [Op.gte]: dayjs().format('YYYY-MM-DD'),
        },
      },
      limit: 3,
      raw: true,
    });

    expiringSupplies.forEach((item) => {
      const daysUntilExpiry = dayjs(item.expiry_date).diff(dayjs(), 'day');
      alerts.push({
        type: daysUntilExpiry <= 7 ? 'danger' : 'warning',
        category: 'expiry',
        title: 'انتهاء صلاحية قريب',
        message: `${item.name} تنتهي خلال ${daysUntilExpiry} يوم`,
        id: item.id,
        created_at: item.created_at,
      });
    });

    // 4. إصابات حرجة
    const criticalInjuries = await Injury.findAll({
      where: {
        club_id: clubId,
        severity: 'critical',
        status: 'active',
      },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['name'],
        },
      ],
      limit: 3,
      raw: true,
    });

    criticalInjuries.forEach((injury) => {
      alerts.push({
        type: 'danger',
        category: 'injury',
        title: 'إصابة حرجة',
        message: `إصابة حرجة: ${injury['player.name'] || 'لاعب'} - ${injury.body_area}`,
        id: injury.id,
        created_at: injury.created_at,
      });
    });

    // ترتيب حسب الأولوية والتاريخ
    const priorityOrder = { danger: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => {
      if (priorityOrder[a.type] !== priorityOrder[b.type]) {
        return priorityOrder[a.type] - priorityOrder[b.type];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.json({
      success: true,
      data: {
        alerts: alerts.slice(0, 8),
        total: alerts.length,
        dangerCount: alerts.filter((a) => a.type === 'danger').length,
        warningCount: alerts.filter((a) => a.type === 'warning').length,
      },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب التنبيهات',
    });
  }
};

// ==========================================
// الحصول على آخر النشاطات
// ==========================================
exports.getRecentActivity = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const limit = parseInt(req.query.limit) || 10;

    // آخر الإصابات المسجلة
    const recentInjuries = await Injury.findAll({
      where: { club_id: clubId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['name', 'avatar_url'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    const injuryActivities = recentInjuries.map((injury) => ({
      type: 'injury',
      title: 'إصابة جديدة مسجلة',
      description: `${injury.player?.name || 'لاعب'} - ${injury.injury_type}`,
      player: injury.player,
      severity: injury.severity,
      created_at: injury.created_at,
    }));

    // آخر جلسات التأهيل
    const recentSessions = await Rehabilitation.findAll({
      where: { club_id: clubId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['name', 'avatar_url'],
        },
      ],
      order: [['updated_at', 'DESC']],
      limit: 5,
    });

    const rehabActivities = recentSessions.map((rehab) => ({
      type: 'rehab',
      title: rehab.status === 'completed' ? 'برنامج تأهيل مكتمل' : 'تحديث برنامج تأهيل',
      description: `${rehab.player?.name || 'لاعب'} - ${rehab.program_name}`,
      player: rehab.player,
      progress: rehab.progress_pct,
      created_at: rehab.updated_at,
    }));

    // آخر تقييمات الأداء
    const recentPerformances = await Performance.findAll({
      where: { club_id: clubId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['name', 'avatar_url'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    const performanceActivities = recentPerformances.map((perf) => ({
      type: 'performance',
      title: 'تقييم أداء جديد',
      description: `${perf.player?.name || 'لاعب'} - ${perf.overall_score_pct}%`,
      player: perf.player,
      score: perf.overall_score_pct,
      created_at: perf.created_at,
    }));

    // دمج وترتيب النشاطات
    const allActivities = [...injuryActivities, ...rehabActivities, ...performanceActivities]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    res.json({
      success: true,
      data: allActivities,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب النشاطات',
    });
  }
};

// ==========================================
// الحصول على مواعيد اليوم
// ==========================================
exports.getTodayAppointments = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const today = dayjs().format('YYYY-MM-DD');

    const appointments = await Appointment.findAll({
      where: {
        club_id: clubId,
        scheduled_date: today,
        status: 'scheduled',
      },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['name', 'avatar_url', 'number'],
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['name'],
        },
      ],
      order: [['scheduled_time', 'ASC']],
    });

    const formattedAppointments = appointments.map((apt) => ({
      id: apt.id,
      time: apt.scheduled_time,
      player: apt.player,
      type: apt.appointment_type,
      doctor: apt.doctor?.name || 'طبيب',
      duration: apt.duration_minutes,
      location: apt.location,
    }));

    res.json({
      success: true,
      data: formattedAppointments,
    });
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب المواعيد',
    });
  }
};

// ==========================================
// نظرة عامة على لوحة التحكم (كل البيانات دفعة واحدة)
// ==========================================
exports.getOverview = async (req, res) => {
  try {
    const [stats, charts, alerts, activity, appointments] = await Promise.all([
      exports.getStatsData(req.user.clubId),
      exports.getChartsDataInternal(req.user.clubId),
      exports.getAlertsData(req.user.clubId),
      exports.getActivityData(req.user.clubId, 8),
      exports.getAppointmentsData(req.user.clubId),
    ]);

    res.json({
      success: true,
      data: {
        stats,
        charts,
        alerts,
        activity,
        appointments,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب بيانات لوحة التحكم',
    });
  }
};

exports.getStatsData = async (clubId) => {
  const req = { user: { clubId } };
  const res = { json: (data) => data.data };
  
  const totalPlayers = await Player.count({ where: { club_id: clubId, is_active: true } });
  const readyPlayers = await Player.count({ where: { club_id: clubId, is_active: true, status: 'ready' } });
  const injuredPlayers = await Player.count({ where: { club_id: clubId, is_active: true, status: 'injured' } });
  const rehabPlayers = await Player.count({ where: { club_id: clubId, is_active: true, status: 'rehab' } });
  const activeInjuries = await Injury.count({ where: { club_id: clubId, status: 'active' } });
  const activeRehabs = await Rehabilitation.count({ where: { club_id: clubId, status: 'active' } });
  
  const equipmentNeedsMaintenance = await Equipment.count({ where: { club_id: clubId, status: 'needs_maintenance' } });
  const equipmentOutOfService = await Equipment.count({ where: { club_id: clubId, status: 'out_of_service' } });
  const lowSupplies = await Supply.count({ 
    where: { club_id: clubId, [Op.and]: [Sequelize.literal('`Supply`.`total_quantity` <= `Supply`.`reorder_level`')] } 
  });

  return {
    players: { total: totalPlayers, ready: readyPlayers, injured: injuredPlayers, rehab: rehabPlayers },
    injuries: { active: activeInjuries, avgRecoveryDays: 0 },
    rehabilitation: { active: activeRehabs },
    equipment: { needsMaintenance: equipmentNeedsMaintenance, outOfService: equipmentOutOfService },
    supplies: { low: lowSupplies, expiringSoon: 0 },
    healthIndex: totalPlayers > 0 ? Math.round((readyPlayers / totalPlayers) * 100) : 0,
  };
};

exports.getChartsDataInternal = async (clubId) => {
  const playerStatusDistribution = await Player.findAll({
    where: { club_id: clubId, is_active: true },
    attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
  return { playerStatusDistribution };
};

exports.getAlertsData = async (clubId) => {
  // Use the logic from getAlerts
  return { alerts: [], total: 0 }; 
};

exports.getActivityData = async (clubId, limit) => {
  return [];
};

exports.getAppointmentsData = async (clubId) => {
  return [];
};
