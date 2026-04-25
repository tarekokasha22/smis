const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const vitalsController = require('../controllers/vitals.controller');

// جميع المسارات تتطلب مصادقة + صلاحية النادي
router.use(verifyToken, verifyClubAccess);

// نظرة عامة على آخر قياس لكل لاعب
router.get('/overview', vitalsController.getVitalsOverview);

// إحصائيات وتحليلات المؤشرات الحيوية
router.get('/stats', vitalsController.getVitalsStats);

// الحصول على قائمة القياسات (مع فلترة)
router.get('/', vitalsController.getAllVitals);

// الحصول على تفاصيل قياس
router.get('/:id', vitalsController.getVitalById);

// مؤشرات لاعب بعينه مع الرسوم البيانية
router.get('/player/:playerId', vitalsController.getPlayerVitals);

// إنشاء قياس جديد
router.post(
  '/',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']),
  vitalsController.createVital
);

// إنشاء قياسات جماعية
router.post(
  '/bulk',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']),
  vitalsController.createBulkVitals
);

// تحديث قياس
router.put(
  '/:id',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']),
  vitalsController.updateVital
);

// حذف قياس
router.delete(
  '/:id',
  requireRole(['club_admin', 'doctor', 'manager']),
  vitalsController.deleteVital
);

module.exports = router;
