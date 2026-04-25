const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const reportsController = require('../controllers/reports.controller');

router.use(verifyToken, verifyClubAccess);

// قائمة اللاعبين للتقارير
router.get('/players', reportsController.getReportPlayers);

// تقرير صحة الفريق
router.get('/team-health', reportsController.getTeamHealthReport);

// تقرير لاعب محدد
router.get('/player/:player_id', reportsController.getPlayerReport);

// تقرير الإصابات
router.get('/injuries', reportsController.getInjuryReport);

// تقرير التأهيل
router.get('/rehabilitation', reportsController.getRehabReport);

// تقرير المؤشرات الحيوية
router.get('/vitals', reportsController.getVitalsReport);

// تقرير المواعيد
router.get('/appointments', reportsController.getAppointmentsReport);

// تقرير تقييم الأداء
router.get('/performance', reportsController.getPerformanceReport);

// تقرير المعدات والصيانة
router.get('/equipment', reportsController.getEquipmentReport);

// تقرير المستلزمات والمخزون
router.get('/supplies', reportsController.getSuppliesReport);

// تقرير قياسات الجسم
router.get('/measurements', reportsController.getMeasurementsReport);

module.exports = router;
