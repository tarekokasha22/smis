const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const filesController = require('../controllers/files.controller');

// جميع المسارات تتطلب مصادقة
router.use(verifyToken, verifyClubAccess);

// إحصائيات الملفات
router.get('/stats', filesController.getFileStats);

// قائمة الملفات
router.get('/', filesController.getAllFiles);

// تفاصيل ملف
router.get('/:id', filesController.getFileById);

// تحميل ملف
router.get('/:id/download', filesController.downloadFile);

// رفع ملف جديد
router.post(
  '/',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']),
  filesController.upload.single('file'),
  filesController.uploadFile
);

// تحديث بيانات ملف
router.put(
  '/:id',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']),
  filesController.updateFile
);

// حذف ملف
router.delete(
  '/:id',
  requireRole(['club_admin', 'doctor', 'manager']),
  filesController.deleteFile
);

module.exports = router;
