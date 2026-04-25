const { Notification, User } = require('../models');

const broadcastToClub = async (clubId, type, title, body, relatedEntityType, relatedEntityId, priority = 'medium') => {
  try {
    const users = await User.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['id'],
    });

    if (!users.length) return;

    await Notification.bulkCreate(users.map((u) => ({
      club_id: clubId,
      user_id: u.id,
      type,
      title,
      body,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      priority,
      is_read: false,
    })));
  } catch (err) {
    console.error('خطأ في إرسال الإشعار:', err.message);
  }
};

const notifyInjuryCreated = async (clubId, userId, playerName, injuryType, severity, injuryId) => {
  const priorityMap = { critical: 'urgent', severe: 'high', moderate: 'medium', mild: 'low' };
  await broadcastToClub(
    clubId,
    'injury_created',
    'إصابة جديدة مسجلة',
    `تم تسجيل إصابة "${injuryType}" للاعب ${playerName}`,
    'Injury', injuryId,
    priorityMap[severity] || 'medium'
  );
};

const notifyInjuryRecovered = async (clubId, userId, playerName, injuryId) => {
  await broadcastToClub(
    clubId,
    'injury_recovered',
    'تعافٍ من الإصابة',
    `تم تسجيل تعافي اللاعب ${playerName} من الإصابة`,
    'Injury', injuryId,
    'medium'
  );
};

const notifyAppointmentCreated = async (clubId, userId, playerName, appointmentType, scheduledDate, appointmentId) => {
  await broadcastToClub(
    clubId,
    'appointment_created',
    'موعد جديد',
    `تم تحديد موعد "${appointmentType}" للاعب ${playerName} بتاريخ ${scheduledDate}`,
    'Appointment', appointmentId,
    'medium'
  );
};

const notifyEquipmentMaintenance = async (clubId, equipmentName, equipmentId) => {
  await broadcastToClub(
    clubId,
    'equipment_maintenance',
    'تسجيل صيانة معدة',
    `تم تسجيل صيانة للمعدة "${equipmentName}"`,
    'Equipment', equipmentId,
    'high'
  );
};

const notifyLowStock = async (clubId, supplyName, remaining, supplyId) => {
  await broadcastToClub(
    clubId,
    'supply_low_stock',
    'مخزون منخفض',
    `المستلزم "${supplyName}" وصل إلى مستوى منخفض (${remaining} متبقي)`,
    'Supply', supplyId,
    'high'
  );
};

const notifySupplyDispensed = async (clubId, supplyName, playerName, quantity, supplyId) => {
  await broadcastToClub(
    clubId,
    'supply_dispensed',
    'صرف مستلزم للاعب',
    `تم صرف ${quantity} من "${supplyName}" للاعب ${playerName}`,
    'Supply', supplyId,
    'low'
  );
};

const notifyAbnormalVital = async (clubId, playerName, abnormalValues, vitalId) => {
  await broadcastToClub(
    clubId,
    'vital_abnormal',
    'قراءة حيوية غير طبيعية',
    `رصد قراءات غير طبيعية للاعب ${playerName}: ${abnormalValues}`,
    'Vital', vitalId,
    'high'
  );
};

module.exports = {
  broadcastToClub,
  notifyInjuryCreated,
  notifyInjuryRecovered,
  notifyAppointmentCreated,
  notifyEquipmentMaintenance,
  notifyLowStock,
  notifySupplyDispensed,
  notifyAbnormalVital,
};
