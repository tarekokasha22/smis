const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const injuriesController = require('../controllers/injuries.controller');

// جميع المسارات تتطلب مصادقة + صلاحية النادي
router.use(verifyToken, verifyClubAccess);

// الحصول على قائمة الإصابات (مع فلترة وبحث)
router.get('/', injuriesController.getAllInjuries);

// الحصول على إحصائيات الإصابات
router.get('/stats', injuriesController.getInjuryStats);

// الحصول على قائمة الأطباء المعالجين
router.get('/doctors', injuriesController.getDoctors);

// الحصول على تفاصيل إصابة
router.get('/:id', injuriesController.getInjuryById);

// إنشاء إصابة جديدة
router.post('/', requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']), injuriesController.createInjury);

// تحديث إصابة
router.put('/:id', requireRole(['club_admin', 'doctor', 'manager']), injuriesController.updateInjury);

// إغلاق إصابة (تعافى)
router.patch('/:id/close', requireRole(['club_admin', 'doctor', 'manager']), injuriesController.closeInjury);

// تحديث حالة الإصابة
router.patch('/:id/status', requireRole(['club_admin', 'doctor', 'manager']), injuriesController.updateInjuryStatus);

// حذف إصابة
router.delete('/:id', requireRole(['club_admin', 'manager']), injuriesController.deleteInjury);

module.exports = router;
