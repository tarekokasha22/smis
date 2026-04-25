const { Op } = require('sequelize');
const { Performance, Player, User, sequelize } = require('../models');

const METRIC_LABELS = {
  vo2_max: 'VO2 Max',
  max_speed_kmh: 'السرعة القصوى',
  strength_pct: 'القوة',
  endurance_pct: 'التحمل',
  flexibility_pct: 'المرونة',
  agility_score: 'الرشاقة',
  reaction_time_ms: 'زمن الاستجابة',
  overall_score_pct: 'النتيجة الإجمالية',
};

exports.getAllPerformances = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { page = 1, limit = 20, player_id = '', start_date = '', end_date = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = { club_id: clubId };

    if (player_id) whereCondition.player_id = parseInt(player_id);
    if (start_date && end_date) {
      whereCondition.evaluation_date = { [Op.between]: [start_date, end_date] };
    }

    const { count, rows } = await Performance.findAndCountAll({
      where: whereCondition,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'evaluator', attributes: ['id', 'name'] },
      ],
      order: [['evaluation_date', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ success: true, data: rows, meta: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};

exports.getPerformanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await Performance.findOne({
      where: { id, club_id: req.user.clubId },
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'evaluator', attributes: ['id', 'name'] },
      ],
    });
    if (!performance) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'التقييم غير موجود' });
    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};

exports.createPerformance = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const data = req.body;

    if (!data.player_id || !data.evaluation_date) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'اللاعب والتاريخ مطلوبان' });
    }

    const player = await Player.findOne({ where: { id: data.player_id, club_id: clubId } });
    if (!player) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'اللاعب غير موجود' });

    const performance = await Performance.create({
      club_id: clubId,
      player_id: data.player_id,
      evaluator_id: userId,
      evaluation_date: data.evaluation_date,
      vo2_max: data.vo2_max,
      max_speed_kmh: data.max_speed_kmh,
      strength_pct: data.strength_pct,
      endurance_pct: data.endurance_pct,
      flexibility_pct: data.flexibility_pct,
      agility_score: data.agility_score,
      reaction_time_ms: data.reaction_time_ms,
      overall_score_pct: data.overall_score_pct,
      trend: data.trend,
      comparison_previous_pct: data.comparison_previous_pct,
      physical_readiness_pct: data.physical_readiness_pct,
      mental_readiness_pct: data.mental_readiness_pct,
      notes: data.notes,
      recommendations: data.recommendations,
    });

    res.status(201).json({ success: true, data: performance, message: 'تم إضافة التقييم بنجاح' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};

exports.updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const performance = await Performance.findOne({ where: { id, club_id: req.user.clubId } });
    if (!performance) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'التقييم غير موجود' });

    await performance.update(data);
    res.json({ success: true, data: performance, message: 'تم التحديث بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};

exports.deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await Performance.findOne({ where: { id, club_id: req.user.clubId } });
    if (!performance) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'التقييم غير موجود' });

    await performance.destroy();
    res.json({ success: true, message: 'تم الحذف بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};

exports.getPerformanceMeta = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const players = await Player.findAll({ where: { club_id: clubId, is_active: true }, attributes: ['id', 'name', 'number', 'position'], order: [['name', 'ASC']] });
    const evaluators = await User.findAll({ where: { club_id: clubId, is_active: true, role: { [Op.in]: ['coach', 'doctor', 'physiotherapist', 'analyst'] } }, attributes: ['id', 'name'], order: [['name', 'ASC']] });
    const trendOptions = [
      { value: 'up', label: 'تحسن', icon: '↑' },
      { value: 'stable', label: 'ثابت', icon: '→' },
      { value: 'down', label: 'تراجع', icon: '↓' },
    ];
    res.json({ success: true, data: { players, evaluators, trendOptions, metricLabels: METRIC_LABELS } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};

exports.getPlayerPerformanceHistory = async (req, res) => {
  try {
    const { playerId } = req.params;
    const clubId = req.user.clubId;
    const { limit = 10 } = req.query;

    const performances = await Performance.findAll({
      where: { club_id: clubId, player_id: playerId },
      include: [{ model: User, as: 'evaluator', attributes: ['id', 'name'] }],
      order: [['evaluation_date', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({ success: true, data: performances });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};

exports.getTeamAverage = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { evaluation_date } = req.query;

    const whereCondition = { club_id: clubId };
    if (evaluation_date) whereCondition.evaluation_date = evaluation_date;

    const performances = await Performance.findAll({ where: whereCondition });

    if (performances.length === 0) {
      return res.json({ success: true, data: null, message: 'لا توجد بيانات' });
    }

    const avg = (field) => {
      const values = performances.map(p => p[field]).filter(v => v != null);
      return values.length ? +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null;
    };

    res.json({
      success: true,
      data: {
        count: performances.length,
        vo2_max: avg('vo2_max'),
        max_speed_kmh: avg('max_speed_kmh'),
        strength_pct: avg('strength_pct'),
        endurance_pct: avg('endurance_pct'),
        flexibility_pct: avg('flexibility_pct'),
        agility_score: avg('agility_score'),
        overall_score_pct: avg('overall_score_pct'),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'حدث خطأ' });
  }
};