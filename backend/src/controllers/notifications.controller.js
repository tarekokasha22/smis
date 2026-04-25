const { Op } = require('sequelize');
const { Notification, sequelize } = require('../models');

const TYPE_LABELS = {
  injury: 'إصابة',
  rehab: 'تأهيل',
  appointment: 'موعد',
  equipment: 'معدات',
  supplies: 'مستلزمات',
  system: 'نظام',
  performance: 'أداء',
};

exports.getAllNotifications = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 20,
      is_read = '',
      type = '',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = {
      club_id: clubId,
      user_id: userId,
    };

    if (is_read === 'true') {
      whereCondition.is_read = true;
    } else if (is_read === 'false') {
      whereCondition.is_read = false;
    }

    if (type) {
      whereCondition.type = type;
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const unreadCount = await Notification.count({
      where: {
        club_id: clubId,
        user_id: userId,
        is_read: false,
      },
    });

    res.json({
      success: true,
      data: notifications,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب الإشعارات',
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;

    const count = await Notification.count({
      where: {
        club_id: clubId,
        user_id: userId,
        is_read: false,
      },
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب عدد الإشعارات غير المقروءة',
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, club_id: clubId, user_id: userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'الإشعار غير موجود',
      });
    }

    await notification.update({ is_read: true });

    res.json({
      success: true,
      data: notification,
      message: 'تم تعليم الإشعار كمقروء',
    });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تعليم الإشعار',
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;

    await Notification.update(
      { is_read: true },
      { where: { club_id: clubId, user_id: userId, is_read: false } }
    );

    res.json({
      success: true,
      message: 'تم تعليم جميع الإشعارات كمقروءة',
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تعليم الإشعارات',
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, club_id: clubId, user_id: userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'الإشعار غير موجود',
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء حذف الإشعار',
    });
  }
};

exports.createNotification = async (data) => {
  try {
    const { clubId, userId, type, title, body, relatedEntityType, relatedEntityId, priority = 'medium' } = data;

    await Notification.create({
      club_id: clubId,
      user_id: userId,
      type: type,
      title,
      body,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      priority,
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

exports.broadcastToClub = async (clubId, type, title, body, relatedEntityType, relatedEntityId, priority = 'medium') => {
  try {
    const { User } = require('../models');
    const users = await User.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['id'],
    });

    const notifications = users.map((user) => ({
      club_id: clubId,
      user_id: user.id,
      type,
      title,
      body,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      priority,
    }));

    await Notification.bulkCreate(notifications);
  } catch (error) {
    console.error('Error broadcasting notification:', error.message);
  }
};