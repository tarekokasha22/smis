const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const auditController = require('../controllers/audit.controller');

router.use(verifyToken, verifyClubAccess);

router.get('/', auditController.getAllAuditLogs);

router.get('/meta', auditController.getAuditMeta);

router.get('/export', requireRole(['club_admin', 'manager']), auditController.exportAuditLogs);

router.get('/:id', auditController.getAuditLogById);

module.exports = router;