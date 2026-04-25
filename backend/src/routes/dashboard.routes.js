const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// جميع مسارات لوحة التحكم تتطلب مصادقة + صلاحية النادي
router.use(verifyToken, verifyClubAccess);

// الحصول على إحصائيات لوحة التحكم
router.get('/stats', dashboardController.getStats);

// الحصول على بيانات الرسوم البيانية
router.get('/charts', dashboardController.getChartsData);

// الحصول على التنبيهات
router.get('/alerts', dashboardController.getAlerts);

// الحصول على آخر النشاطات
router.get('/activity', dashboardController.getRecentActivity);

// الحصول على مواعيد اليوم
router.get('/today-appointments', dashboardController.getTodayAppointments);

// الحصول على كل بيانات لوحة التحكم دفعة واحدة
router.get('/overview', dashboardController.getOverview);

module.exports = router;
