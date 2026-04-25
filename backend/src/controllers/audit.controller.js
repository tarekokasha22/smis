const { Op } = require('sequelize');
const { AuditLog, sequelize } = require('../models');

const ACTION_LABELS = {
  CREATE: 'إنشاء',
  UPDATE: 'تعديل',
  DELETE: 'حذف',
};

const ENTITY_LABELS = {
  Player: 'اللاعب',
  Injury: 'الإصابات',
  Vital: 'المؤشرات الحيوية',
  Rehabilitation: 'التأهيل',
  Equipment: 'المعدات',
  Supply: 'المستلزمات',
  Appointment: 'المواعيد',
  Performance: 'تقييم الأداء',
  User: 'المستخدمين',
  Club: 'النادي',
};

exports.getAllAuditLogs = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      search = '',
      action = '',
      entity_type = '',
      user_id = '',
      start_date = '',
      end_date = '',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = {
      club_id: clubId,
    };

    if (action) {
      whereCondition.action = action;
    }

    if (entity_type) {
      whereCondition.entity_type = entity_type;
    }

    if (user_id) {
      whereCondition.user_id = parseInt(user_id);
    }

    if (start_date && end_date) {
      whereCondition.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    } else if (start_date) {
      whereCondition.created_at = {
        [Op.gte]: new Date(start_date),
      };
    } else if (end_date) {
      whereCondition.created_at = {
        [Op.lte]: new Date(end_date),
      };
    }

    if (search) {
      whereCondition[Op.or] = [
        { user_name: { [Op.like]: `%${search}%` } },
        { entity_type: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: logs,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب سجل النشاط',
    });
  }
};

exports.getAuditMeta = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    const actions = ['CREATE', 'UPDATE', 'DELETE'];

    const entityTypes = await AuditLog.findAll({
      where: { club_id: clubId },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('entity_type')), 'entity_type']],
      raw: true,
    });

    const users = await AuditLog.findAll({
      where: { club_id: clubId },
      attributes: ['user_id', 'user_name'],
      group: ['user_id', 'user_name'],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        actions,
        entityTypes: entityTypes.map((e) => e.entity_type).filter(Boolean),
        users: users.filter((u) => u.user_id),
      },
    });
  } catch (error) {
    console.error('Error fetching audit meta:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب البيانات الوصفية',
    });
  }
};

exports.getAuditLogById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const log = await AuditLog.findOne({
      where: { id, club_id: clubId },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'السجل غير موجود',
      });
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب بيانات السجل',
    });
  }
};

exports.exportAuditLogs = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { start_date, end_date } = req.query;

    const whereCondition = {
      club_id: clubId,
    };

    if (start_date && end_date) {
      whereCondition.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    const logs = await AuditLog.findAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      raw: true,
    });

    const actionLabelMap = {
      CREATE: 'إنشاء',
      UPDATE: 'تعديل',
      DELETE: 'حذف',
    };

    const entityLabelMap = {
      Player: 'اللاعب',
      Injury: 'الإصابات',
      Vital: 'المؤشرات الحيوية',
      Rehabilitation: 'التأهيل',
      Equipment: 'المعدات',
      Supply: 'المستلزمات',
    };

    const BOM = '\uFEFF';
    const csvHeader = `${BOM}التاريخ,المستخدم,الإجراء,الكيان,عنوان IP\n`;
    const csvRows = logs
      .map(
        (log) =>
          `"${log.created_at}","${log.user_name || ''}","${actionLabelMap[log.action] || log.action}","${entityLabelMap[log.entity_type] || log.entity_type}","${log.ip_address || ''}"`
      )
      .join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=audit_log_${new Date().toISOString().split('T')[0]}.csv`
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تصدير سجل النشاط',
    });
  }
};