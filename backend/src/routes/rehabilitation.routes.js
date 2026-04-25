const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const rehabController = require('../controllers/rehabilitation.controller');

// جميع المسارات تتطلب مصادقة + صلاحية النادي
router.use(verifyToken, verifyClubAccess);

// ==========================================
// برامج التأهيل
// ==========================================

// إحصائيات التأهيل
router.get('/stats', rehabController.getRehabStats);

// قائمة المعالجين
router.get('/therapists', rehabController.getTherapists);

// قائمة برامج التأهيل
router.get('/', rehabController.getAllPrograms);

// تفاصيل برنامج تأهيل
router.get('/:id', rehabController.getProgramById);

// إنشاء برنامج جديد
router.post(
  '/',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  rehabController.createProgram
);

// تحديث برنامج
router.put(
  '/:id',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  rehabController.updateProgram
);

// تحديث حالة البرنامج (إكمال / إيقاف مؤقت / إلغاء)
router.patch(
  '/:id/status',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  rehabController.updateProgramStatus
);

// تحديث المرحلة والتقدم
router.patch(
  '/:id/progress',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  rehabController.updateProgress
);

// حذف برنامج
router.delete(
  '/:id',
  requireRole(['club_admin', 'manager']),
  rehabController.deleteProgram
);

// ==========================================
// جلسات التأهيل
// ==========================================

// إضافة جلسة لبرنامج
router.post(
  '/:programId/sessions',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'manager']),
  rehabController.addSession
);

// تحديث جلسة
router.put(
  '/sessions/:sessionId',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'manager']),
  rehabController.updateSession
);

// حذف جلسة
router.delete(
  '/sessions/:sessionId',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  rehabController.deleteSession
);

module.exports = router;
