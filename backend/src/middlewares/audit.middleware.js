const { AuditLog } = require('../models');

const actionMap = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

const ENTITY_TYPE_MAP = {
  players: 'Player',
  injuries: 'Injury',
  vitals: 'Vital',
  rehabilitation: 'Rehabilitation',
  equipment: 'Equipment',
  supplies: 'Supply',
  appointments: 'Appointment',
  performance: 'Performance',
  users: 'User',
  measurements: 'BodyMeasurement',
  files: 'FileRecord',
};

const detectEntityType = (url) => {
  const segment = url.replace('/api/v1/', '').split('/')[0];
  return ENTITY_TYPE_MAP[segment] || segment;
};

const auditLog = (entityType) => {
  return async (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

    const originalJson = res.json.bind(res);
    const requestBody = { ...req.body };
    if (requestBody.password) delete requestBody.password;

    res.json = async (body) => {
      if (body && body.success) {
        try {
          const entityTypeName = entityType
            ? (ENTITY_TYPE_MAP[entityType] || entityType)
            : detectEntityType(req.originalUrl || req.url);

          await AuditLog.create({
            club_id: req.user?.clubId,
            user_id: req.user?.userId,
            user_name: req.user?.name,
            action: actionMap[req.method],
            entity_type: entityTypeName,
            entity_id: body.data?.id || req.params?.id,
            new_values: req.method !== 'DELETE' ? requestBody : null,
            ip_address: req.ip || req.connection?.remoteAddress,
            user_agent: req.get('User-Agent'),
          });
        } catch (err) {
          console.error('خطأ في تسجيل النشاط:', err.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
};

// Global audit middleware — auto-detects entity from URL
const globalAuditLog = auditLog(null);

const logManualAudit = async (options) => {
  try {
    const { clubId, userId, userName, action, entityType, entityId, newValues, oldValues, ipAddress, userAgent } = options;
    await AuditLog.create({
      club_id: clubId,
      user_id: userId,
      user_name: userName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: newValues,
      old_values: oldValues,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (err) {
    console.error('خطأ في تسجيل النشاط اليدوي:', err.message);
  }
};

module.exports = { auditLog, globalAuditLog, logManualAudit };
