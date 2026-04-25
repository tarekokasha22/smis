const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const notificationsController = require('../controllers/notifications.controller');

router.use(verifyToken, verifyClubAccess);

router.get('/', notificationsController.getAllNotifications);

router.get('/unread-count', notificationsController.getUnreadCount);

router.patch('/:id/read', notificationsController.markAsRead);

router.post('/mark-all-read', notificationsController.markAllAsRead);

router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;