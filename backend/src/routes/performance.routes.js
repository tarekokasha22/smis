const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const performanceController = require('../controllers/performance.controller');

router.use(verifyToken, verifyClubAccess);

router.get('/', performanceController.getAllPerformances);
router.get('/meta', performanceController.getPerformanceMeta);
router.get('/player/:playerId', performanceController.getPlayerPerformanceHistory);
router.get('/team-average', performanceController.getTeamAverage);
router.get('/:id', performanceController.getPerformanceById);
router.post('/', requireRole(['coach', 'doctor', 'physiotherapist', 'manager', 'club_admin']), performanceController.createPerformance);
router.put('/:id', requireRole(['coach', 'doctor', 'physiotherapist', 'manager', 'club_admin']), performanceController.updatePerformance);
router.delete('/:id', requireRole(['club_admin', 'manager']), performanceController.deletePerformance);

module.exports = router;