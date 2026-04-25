const { Op, Sequelize } = require('sequelize');
const { Performance, Injury } = require('../models');
const { getPeriodAnalytics } = require('../services/statistics.service');

const SEASON_DATES = {
  '2023-2024': { from: '2023-07-01', to: '2024-06-30' },
  '2024-2025': { from: '2024-07-01', to: '2025-06-30' },
  '2025-2026': { from: '2025-07-01', to: '2026-06-30' },
};

// ==========================================
// تحليلات الإحصاءات الشاملة للموسم
// ==========================================
exports.getAnalytics = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { season = '2024-2025', dateFrom, dateTo } = req.query;

    let from, to;
    if (dateFrom && dateTo) {
      from = dateFrom;
      to = dateTo;
    } else {
      const dates = SEASON_DATES[season] || SEASON_DATES['2024-2025'];
      from = dates.from;
      to = dates.to;
    }

    // الحصول على التحليلات الأساسية من خدمة الإحصاءات
    const data = await getPeriodAnalytics(clubId, from, to);

    // مؤشرات الأداء الإضافية للفترة (رادار + KPIs)
    const perfRow = await Performance.findOne({
      where: {
        club_id: clubId,
        evaluation_date: { [Op.between]: [from, to] },
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('strength_pct')), 'strength'],
        [Sequelize.fn('AVG', Sequelize.col('endurance_pct')), 'endurance'],
        [Sequelize.fn('AVG', Sequelize.col('flexibility_pct')), 'flexibility'],
        [Sequelize.fn('AVG', Sequelize.col('agility_score')), 'agility'],
        [Sequelize.fn('AVG', Sequelize.col('reaction_time_ms')), 'reaction'],
        [Sequelize.fn('AVG', Sequelize.col('physical_readiness_pct')), 'physical_readiness'],
        [Sequelize.fn('AVG', Sequelize.col('mental_readiness_pct')), 'mental_readiness'],
        [Sequelize.fn('AVG', Sequelize.col('overall_score_pct')), 'overall_score'],
        [Sequelize.fn('AVG', Sequelize.col('vo2_max')), 'vo2_max'],
        [Sequelize.fn('AVG', Sequelize.col('max_speed_kmh')), 'max_speed'],
      ],
      raw: true,
    });

    const performanceRadar = (perfRow && perfRow.strength != null)
      ? [
          { metric: 'القوة', value: Math.round(Number(perfRow.strength) || 0), fullMark: 100 },
          { metric: 'التحمل', value: Math.round(Number(perfRow.endurance) || 0), fullMark: 100 },
          { metric: 'المرونة', value: Math.round(Number(perfRow.flexibility) || 0), fullMark: 100 },
          { metric: 'الرشاقة', value: Math.min(100, Math.round(Number(perfRow.agility) || 0)), fullMark: 100 },
          { metric: 'ردة الفعل', value: Math.min(100, Math.round(100 - (Number(perfRow.reaction) || 0) / 10)), fullMark: 100 },
        ]
      : [];

    const performanceKpis = {
      overallScore: perfRow?.overall_score != null ? Math.round(Number(perfRow.overall_score) * 10) / 10 : null,
      physicalReadiness: perfRow?.physical_readiness != null ? Math.round(Number(perfRow.physical_readiness) * 10) / 10 : null,
      mentalReadiness: perfRow?.mental_readiness != null ? Math.round(Number(perfRow.mental_readiness) * 10) / 10 : null,
      vo2Max: perfRow?.vo2_max != null ? Math.round(Number(perfRow.vo2_max) * 10) / 10 : null,
      maxSpeed: perfRow?.max_speed != null ? Math.round(Number(perfRow.max_speed) * 10) / 10 : null,
    };

    // الإصابات حسب الأسبوع في الفترة المحددة
    const injByWeek = await Injury.findAll({
      where: {
        club_id: clubId,
        injury_date: { [Op.between]: [from, to] },
      },
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('injury_date'), '%Y-%u'), 'yw'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt'],
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('injury_date'), '%Y-%u')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('injury_date'), '%Y-%u'), 'ASC']],
      limit: 16,
      raw: true,
    });

    const injuriesByWeek = injByWeek.map((r) => ({
      week: `أسبوع ${r.yw ? r.yw.split('-')[1] : '?'}`,
      value: parseInt(r.cnt, 10),
    }));

    res.json({
      success: true,
      data: {
        ...data,
        performanceRadar,
        performanceKpis,
        injuriesByWeek,
        meta: { dateFrom: from, dateTo: to, season },
      },
    });
  } catch (error) {
    console.error('Error fetching statistics analytics:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب الإحصائيات التفصيلية',
    });
  }
};
