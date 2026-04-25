const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const measurementsController = require('../controllers/measurements.controller');

// جميع المسارات تتطلب مصادقة + صلاحية النادي
router.use(verifyToken, verifyClubAccess);

// إحصائيات عامة و متوسطات للقياسات
router.get('/stats', measurementsController.getMeasurementsStats);

// الحصول على قائمة القياسات
router.get('/', measurementsController.getAllMeasurements);

// الحصول على تفاصيل قياس
router.get('/:id', measurementsController.getMeasurementById);

// الحصول على قياسات لاعب معين لتكوين رسم بياني
router.get('/player/:playerId', measurementsController.getPlayerMeasurements);

// إنشاء قياس جديد
router.post(
  '/',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']),
  measurementsController.createMeasurement
);

// تحديث قياس
router.put(
  '/:id',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']),
  measurementsController.updateMeasurement
);

// حذف قياس
router.delete(
  '/:id',
  requireRole(['club_admin', 'doctor', 'manager']),
  measurementsController.deleteMeasurement
);

module.exports = router;
