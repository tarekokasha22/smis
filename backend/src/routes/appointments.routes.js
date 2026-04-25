const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const appointmentsController = require('../controllers/appointments.controller');

router.use(verifyToken, verifyClubAccess);

router.get('/', appointmentsController.getAllAppointments);

router.get('/meta', appointmentsController.getAppointmentsMeta);

router.get('/today', appointmentsController.getTodayAppointments);

router.get('/:id', appointmentsController.getAppointmentById);

router.post('/', requireRole(['club_admin', 'doctor', 'manager', 'physiotherapist']), appointmentsController.createAppointment);

router.put('/:id', requireRole(['club_admin', 'doctor', 'manager', 'physiotherapist']), appointmentsController.updateAppointment);

router.patch('/:id/status', requireRole(['club_admin', 'doctor', 'manager', 'physiotherapist']), appointmentsController.updateStatus);

router.delete('/:id', requireRole(['club_admin', 'doctor', 'manager']), appointmentsController.deleteAppointment);

module.exports = router;