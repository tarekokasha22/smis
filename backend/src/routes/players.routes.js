const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const playersController = require('../controllers/players.controller');
const { upload } = require('../config/multer');

// جميع المسارات تتطلب مصادقة + صلاحية النادي
router.use(verifyToken, verifyClubAccess);

// الحصول على قائمة اللاعبين (مع فلترة وبحث)
router.get('/', playersController.getAllPlayers);

// الحصول على قائمة المراكز والحالات (للفلاتر)
router.get('/meta', playersController.getPlayersMeta);

// إنشاء لاعب جديد
router.post('/', requireRole(['club_admin', 'doctor', 'manager']), playersController.createPlayer);

// رفع صورة اللاعب
router.post('/:id/photo', requireRole(['club_admin', 'doctor', 'manager']), upload.single('photo'), playersController.uploadPhoto);

// الحصول على تفاصيل لاعب
router.get('/:id', playersController.getPlayerById);

// تحديث بيانات لاعب
router.put('/:id', requireRole(['club_admin', 'doctor', 'manager']), playersController.updatePlayer);

// تغيير حالة اللاعب (نشط/غير نشط)
router.patch('/:id/status', requireRole(['club_admin', 'doctor', 'manager']), playersController.togglePlayerStatus);

// حذف لاعب (soft delete)
router.delete('/:id', requireRole(['club_admin', 'manager']), playersController.deletePlayer);

// الحصول على سجل اللاعب (timeline)
router.get('/:id/timeline', playersController.getPlayerTimeline);

module.exports = router;
