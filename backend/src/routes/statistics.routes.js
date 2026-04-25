const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const statisticsController = require('../controllers/statistics.controller');

router.use(verifyToken, verifyClubAccess);

// تحليلات الإحصاءات الشاملة للموسم
router.get('/analytics', statisticsController.getAnalytics);

module.exports = router;
