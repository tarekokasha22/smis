const { Op, Sequelize } = require('sequelize');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');

dayjs.extend(isoWeek);

const {
  sequelize,
  Player,
  Injury,
  Rehabilitation,
  RehabSession,
  Equipment,
  Supply,
  SupplyTransaction,
  Appointment,
  Performance,
  Vital,
  FileRecord,
  BodyMeasurement,
} = require('../models');

const { QueryTypes } = Sequelize;

const SUPPLY_CAT_AR = {
  medication: 'أدوية',
  topical: 'موضعية',
  supplement: 'مكملات',
  consumable: 'مستهلكات',
  equipment_consumable: 'مستهلكات أجهزة',
};

const FILE_TYPE_AR = {
  xray: 'أشعة سينية',
  mri: 'رنين مغناطيسي',
  scan: 'فحوصات',
  report: 'تقارير',
  contract: 'عقود',
  lab: 'مختبر',
  other: 'أخرى',
};

function weekBuckets(fromStr, toStr) {
  const buckets = [];
  let cur = dayjs(fromStr).startOf('isoWeek');
  const end = dayjs(toStr);
  let guard = 0;
  while ((cur.isBefore(end) || cur.isSame(end, 'day')) && guard < 104) {
    guard += 1;
    const wsRaw = cur.format('YYYY-MM-DD');
    const weRaw = cur.endOf('isoWeek').format('YYYY-MM-DD');
    const weekStart = wsRaw < fromStr ? fromStr : wsRaw;
    const weekEnd = weRaw > toStr ? toStr : weRaw;
    if (weekStart <= weekEnd) {
      buckets.push({
        weekStart,
        weekEnd,
        label: `أسبوع ${cur.isoWeek()}/${cur.year()}`,
      });
    }
    cur = cur.add(1, 'week');
  }
  return buckets;
}

function availabilitySeries(totalPlayers, injuriesOverlap, fromStr, toStr) {
  if (!totalPlayers) return [];
  const buckets = weekBuckets(fromStr, toStr);
  return buckets.map(({ weekStart, weekEnd, label }) => {
    const sidelined = new Set();
    injuriesOverlap.forEach((row) => {
      const id = row.player_id;
      const injStart = row.injury_date;
      const ret = row.return_date;
      if (injStart <= weekEnd && (!ret || ret >= weekStart)) {
        sidelined.add(id);
      }
    });
    const unavailable = sidelined.size;
    const available = Math.max(0, totalPlayers - unavailable);
    const rate = Math.round((available / totalPlayers) * 1000) / 10;
    return {
      label,
      weekStart,
      weekEnd,
      available,
      unavailable,
      availabilityRate: rate,
    };
  });
}

/**
 * تحليلات موسعة لفترة زمنية محددة (نادي واحد)
 */
async function getPeriodAnalytics(clubId, dateFrom, dateTo) {
  const startDt = dayjs(dateFrom).startOf('day').toDate();
  const endDt = dayjs(dateTo).endOf('day').toDate();

  const totalPlayers = await Player.count({
    where: { club_id: clubId, is_active: true },
  });
  const readyPlayers = await Player.count({
    where: { club_id: clubId, is_active: true, status: 'ready' },
  });
  const injuredPlayers = await Player.count({
    where: { club_id: clubId, is_active: true, status: 'injured' },
  });
  const rehabPlayers = await Player.count({
    where: { club_id: clubId, is_active: true, status: 'rehab' },
  });

  const healthIndex = totalPlayers > 0
    ? Math.round((readyPlayers / totalPlayers) * 100)
    : 0;

  const injuryWherePeriod = {
    club_id: clubId,
    injury_date: { [Op.between]: [dateFrom, dateTo] },
  };

  const [
    injuriesInPeriod,
    byTypeRows,
    byAreaRows,
    bySeverityRows,
    byOccasionRows,
    byMechanismRows,
    recurringCount,
    injuriesOverlap,
  ] = await Promise.all([
    Injury.count({ where: injuryWherePeriod }),
    Injury.findAll({
      where: injuryWherePeriod,
      attributes: ['injury_type', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
      group: ['injury_type'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      raw: true,
    }),
    Injury.findAll({
      where: injuryWherePeriod,
      attributes: ['body_area', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
      group: ['body_area'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
      limit: 12,
      raw: true,
    }),
    Injury.findAll({
      where: injuryWherePeriod,
      attributes: ['severity', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
      group: ['severity'],
      raw: true,
    }),
    Injury.findAll({
      where: { ...injuryWherePeriod, occurred_during: { [Op.ne]: null } },
      attributes: ['occurred_during', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
      group: ['occurred_during'],
      raw: true,
    }),
    Injury.findAll({
      where: { ...injuryWherePeriod, mechanism: { [Op.ne]: null } },
      attributes: ['mechanism', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
      group: ['mechanism'],
      raw: true,
    }),
    Injury.count({ where: { ...injuryWherePeriod, is_recurring: true } }),
    Injury.findAll({
      where: {
        club_id: clubId,
        injury_date: { [Op.lte]: dateTo },
        [Op.or]: [
          { return_date: null },
          { return_date: { [Op.gte]: dateFrom } },
        ],
      },
      attributes: ['player_id', 'injury_date', 'return_date'],
      raw: true,
    }),
  ]);

  const recurrenceRate = injuriesInPeriod > 0
    ? Math.round((recurringCount / injuriesInPeriod) * 1000) / 10
    : 0;

  const byPositionRows = await sequelize.query(
    `SELECT COALESCE(p.position, 'غير محدد') AS position, COUNT(i.id) AS cnt
     FROM injuries i
     INNER JOIN players p ON p.id = i.player_id AND p.club_id = i.club_id
     WHERE i.club_id = :clubId AND i.injury_date BETWEEN :dateFrom AND :dateTo
     GROUP BY p.position
     ORDER BY cnt DESC
     LIMIT 12`,
    {
      replacements: { clubId, dateFrom, dateTo },
      type: QueryTypes.SELECT,
    }
  );

  const avgRecoveryByType = await sequelize.query(
    `SELECT i.injury_type AS injury_type,
            ROUND(AVG(i.actual_recovery_days), 1) AS avg_days,
            COUNT(i.id) AS sample_size
     FROM injuries i
     WHERE i.club_id = :clubId
       AND i.status = 'closed'
       AND i.actual_recovery_days IS NOT NULL
       AND i.return_date BETWEEN :dateFrom AND :dateTo
     GROUP BY i.injury_type
     HAVING COUNT(i.id) >= 1
     ORDER BY sample_size DESC
     LIMIT 15`,
    {
      replacements: { clubId, dateFrom, dateTo },
      type: QueryTypes.SELECT,
    }
  );

  const monthsSpan = Math.max(1, dayjs(dateTo).diff(dayjs(dateFrom), 'month', true));
  const injuriesPerPlayerMonth = totalPlayers > 0
    ? Math.round((injuriesInPeriod / totalPlayers / monthsSpan) * 100) / 100
    : 0;

  const activeRehabs = await Rehabilitation.count({
    where: { club_id: clubId, status: 'active' },
  });
  const completedRehabsPeriod = await Rehabilitation.count({
    where: {
      club_id: clubId,
      status: 'completed',
      actual_end_date: { [Op.between]: [dateFrom, dateTo] },
    },
  });

  const rehabEffRow = await Rehabilitation.findOne({
    where: {
      club_id: clubId,
      status: 'completed',
      actual_end_date: { [Op.between]: [dateFrom, dateTo] },
      expected_end_date: { [Op.ne]: null },
    },
    attributes: [
      [
        Sequelize.fn(
          'AVG',
          Sequelize.literal(
            '(DATEDIFF(`actual_end_date`, `start_date`) / NULLIF(DATEDIFF(`expected_end_date`, `start_date`), 0))'
          )
        ),
        'efficiency_ratio',
      ],
    ],
    raw: true,
  });

  const sessionStats = await RehabSession.findOne({
    where: {
      club_id: clubId,
      session_date: { [Op.between]: [dateFrom, dateTo] },
    },
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN attendance = 'attended' THEN 1 ELSE 0 END")), 'attended'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN attendance = 'missed' THEN 1 ELSE 0 END")), 'missed'],
      [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN attendance = 'cancelled' THEN 1 ELSE 0 END")), 'cancelled'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
    ],
    raw: true,
  });

  const equipmentByStatus = await Equipment.findAll({
    where: { club_id: clubId },
    attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
    group: ['status'],
    raw: true,
  });

  const topEquipment = await Equipment.findAll({
    where: { club_id: clubId },
    attributes: ['id', 'name', 'usage_count', 'status', 'location'],
    order: [['usage_count', 'DESC']],
    limit: 10,
    raw: true,
  });

  const burnRows = await sequelize.query(
    `SELECT s.category AS category, SUM(ABS(st.quantity_change)) AS total_out
     FROM supply_transactions st
     INNER JOIN supplies s ON s.id = st.supply_id AND s.club_id = st.club_id
     WHERE st.club_id = :clubId
       AND st.transaction_type = 'dispense'
       AND st.transaction_at BETWEEN :startDt AND :endDt
     GROUP BY s.category`,
    {
      replacements: { clubId, startDt, endDt },
      type: QueryTypes.SELECT,
    }
  );

  const appointmentsByStatus = await Appointment.findAll({
    where: {
      club_id: clubId,
      scheduled_date: { [Op.between]: [dateFrom, dateTo] },
    },
    attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
    group: ['status'],
    raw: true,
  });

  const performanceMonthly = await Performance.findAll({
    where: {
      club_id: clubId,
      evaluation_date: { [Op.between]: [dateFrom, dateTo] },
    },
    attributes: [
      [Sequelize.fn('DATE_FORMAT', Sequelize.col('evaluation_date'), '%Y-%m'), 'ym'],
      [Sequelize.fn('AVG', Sequelize.col('overall_score_pct')), 'avg_score'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'eval_count'],
    ],
    group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('evaluation_date'), '%Y-%m')],
    order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('evaluation_date'), '%Y-%m'), 'ASC']],
    raw: true,
  });

  const vitalsTotal = await Vital.count({
    where: {
      club_id: clubId,
      recorded_at: { [Op.between]: [dateFrom, dateTo] },
    },
  });

  const vitalsAbnormal = await Vital.count({
    where: {
      club_id: clubId,
      recorded_at: { [Op.between]: [dateFrom, dateTo] },
      [Op.or]: [
        { heart_rate: { [Op.gt]: 100 } },
        { spo2: { [Op.lt]: 95 } },
        Sequelize.where(
          Sequelize.literal('`Vital`.`blood_pressure_systolic` > 140 OR `Vital`.`blood_pressure_diastolic` > 90'),
          true
        ),
      ],
    },
  });

  const filesByType = await FileRecord.findAll({
    where: {
      club_id: clubId,
      created_at: { [Op.between]: [dateFrom, dateTo] },
    },
    attributes: ['file_type', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt']],
    group: ['file_type'],
    raw: true,
  });

  const bodyMeasurementsCount = await BodyMeasurement.count({
    where: {
      club_id: clubId,
      measured_at: { [Op.between]: [dateFrom, dateTo] },
    },
  });

  const availabilityWeekly = availabilitySeries(
    totalPlayers,
    injuriesOverlap,
    dateFrom,
    dateTo
  );

  const OCCASION_AR = { match: 'مباراة', training: 'تدريب', other: 'أخرى' };
  const MECH_AR = {
    collision: 'تصادم',
    overuse: 'إجهاد',
    fatigue: 'إرهاق',
    unknown: 'غير معروف',
  };
  const SEV_AR = {
    mild: 'بسيطة',
    moderate: 'متوسطة',
    severe: 'شديدة',
    critical: 'حرجة',
  };
  const EQ_STATUS_AR = {
    excellent: 'ممتاز',
    good: 'جيد',
    needs_maintenance: 'يحتاج صيانة',
    out_of_service: 'خارج الخدمة',
  };
  const APT_STATUS_AR = {
    scheduled: 'مجدول',
    completed: 'مكتمل',
    cancelled: 'ملغى',
    no_show: 'لم يحضر',
    rescheduled: 'أعيد جدولته',
  };

  return {
    snapshot: {
      totalPlayers,
      readyPlayers,
      injuredPlayers,
      rehabPlayers,
      healthIndex,
    },
    injuries: {
      countInPeriod: injuriesInPeriod,
      recurrenceRate,
      byType: byTypeRows.map((r) => ({
        name: r.injury_type,
        value: parseInt(r.cnt, 10),
      })),
      byArea: byAreaRows.map((r) => ({
        name: r.body_area,
        value: parseInt(r.cnt, 10),
      })),
      byPosition: byPositionRows.map((r) => ({
        name: r.position,
        value: parseInt(r.cnt, 10),
      })),
      bySeverity: bySeverityRows.map((r) => ({
        name: SEV_AR[r.severity] || r.severity,
        key: r.severity,
        value: parseInt(r.cnt, 10),
      })),
      byOccasion: byOccasionRows.map((r) => ({
        name: OCCASION_AR[r.occurred_during] || r.occurred_during,
        value: parseInt(r.cnt, 10),
      })),
      byMechanism: byMechanismRows.map((r) => ({
        name: MECH_AR[r.mechanism] || r.mechanism,
        value: parseInt(r.cnt, 10),
      })),
      avgRecoveryByType: avgRecoveryByType.map((r) => ({
        injuryType: r.injury_type,
        avgDays: r.avg_days != null ? Number(r.avg_days) : null,
        sampleSize: parseInt(r.sample_size, 10),
      })),
    },
    trainingLoad: {
      hasTrainingHours: false,
      injuriesPerPlayerMonth,
      note: 'معدل الإصابات لكل لاعب شهرياً (تقديري). لم يُسجّل بعد نطاق ساعات التدريب لحساب المعدل لكل 1000 ساعة.',
    },
    rehab: {
      activePrograms: activeRehabs,
      completedInPeriod: completedRehabsPeriod,
      efficiencyRatio: rehabEffRow?.efficiency_ratio != null
        ? Math.round(Number(rehabEffRow.efficiency_ratio) * 100) / 100
        : null,
      sessions: {
        total: parseInt(sessionStats?.total, 10) || 0,
        attended: parseInt(sessionStats?.attended, 10) || 0,
        missed: parseInt(sessionStats?.missed, 10) || 0,
        cancelled: parseInt(sessionStats?.cancelled, 10) || 0,
      },
    },
    availability: {
      weekly: availabilityWeekly,
    },
    equipment: {
      byStatus: equipmentByStatus.map((r) => ({
        name: EQ_STATUS_AR[r.status] || r.status,
        key: r.status,
        value: parseInt(r.cnt, 10),
      })),
      topUtilization: topEquipment.map((e) => ({
        id: e.id,
        name: e.name,
        usageCount: e.usage_count,
        status: e.status,
        location: e.location,
      })),
    },
    supplies: {
      burnByCategory: burnRows.map((r) => ({
        category: r.category,
        label: SUPPLY_CAT_AR[r.category] || r.category,
        quantity: parseInt(r.total_out, 10) || 0,
      })),
    },
    appointments: {
      byStatus: appointmentsByStatus.map((r) => ({
        name: APT_STATUS_AR[r.status] || r.status,
        key: r.status,
        value: parseInt(r.cnt, 10),
      })),
    },
    performance: {
      monthlyTrend: performanceMonthly.map((r) => ({
        month: r.ym,
        avgScore: r.avg_score != null ? Math.round(Number(r.avg_score) * 10) / 10 : null,
        count: parseInt(r.eval_count, 10),
      })),
    },
    vitals: {
      readingsCount: vitalsTotal,
      abnormalCount: vitalsAbnormal,
      abnormalRatePct: vitalsTotal > 0
        ? Math.round((vitalsAbnormal / vitalsTotal) * 1000) / 10
        : 0,
    },
    files: {
      byType: filesByType.map((r) => ({
        name: FILE_TYPE_AR[r.file_type] || r.file_type,
        key: r.file_type,
        value: parseInt(r.cnt, 10),
      })),
    },
    bodyMeasurements: {
      recordsInPeriod: bodyMeasurementsCount,
    },
  };
}

module.exports = {
  getPeriodAnalytics,
};
