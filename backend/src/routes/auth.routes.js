const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validate, loginSchema, changePasswordSchema } = require('../utils/validators');

// عام - بدون توثيق
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// يتطلب توثيق
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getMe);
router.put('/me', verifyToken, authController.updateProfile);
router.put('/change-password', verifyToken, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
