const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const settingsController = require('../controllers/settings.controller');
const { upload } = require('../config/multer');

router.use(verifyToken, verifyClubAccess);

router.get('/meta', settingsController.getSettingsMeta);

router.get('/club', settingsController.getClubSettings);

router.put('/club', requireRole(['club_admin']), settingsController.updateClubSettings);

router.post('/club/logo', requireRole(['club_admin']), upload.single('logo'), settingsController.uploadClubLogo);

router.get('/profile', settingsController.getUserProfile);

router.put('/profile', settingsController.updateUserProfile);

router.post('/profile/avatar', upload.single('avatar'), settingsController.uploadAvatar);

router.post('/change-password', settingsController.changePassword);

module.exports = router;