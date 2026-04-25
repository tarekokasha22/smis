const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const usersController = require('../controllers/users.controller');

router.use(verifyToken, verifyClubAccess);

router.get('/', usersController.getAllUsers);

router.get('/meta', usersController.getUsersMeta);

router.post('/', requireRole(['club_admin']), usersController.createUser);

router.get('/:id', usersController.getUserById);

router.put('/:id', requireRole(['club_admin']), usersController.updateUser);

router.patch('/:id/status', requireRole(['club_admin']), usersController.toggleUserStatus);

router.post('/:id/reset-password', requireRole(['club_admin']), usersController.resetPassword);

router.delete('/:id', requireRole(['club_admin']), usersController.deleteUser);

module.exports = router;