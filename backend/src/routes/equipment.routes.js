const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifyClubAccess } = require('../middlewares/club.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const equipmentController = require('../controllers/equipment.controller');

// جميع المسارات تتطلب مصادقة + صلاحية النادي
router.use(verifyToken, verifyClubAccess);

// ==========================================
// مسارات المستلزمات والأدوية
// (يجب أن تأتي أولاً قبل /:id لتجنب التعارض)
// ==========================================

// إحصائيات المستلزمات
router.get('/supplies/stats', equipmentController.getSuppliesStats);

// قائمة المستلزمات
router.get('/supplies/list', equipmentController.getAllSupplies);

// إضافة مستلزم
router.post(
  '/supplies',
  requireRole(['club_admin', 'doctor', 'nurse', 'physiotherapist', 'manager']),
  equipmentController.createSupply
);

// سجل معاملات مستلزم (يجب قبل /supplies/:id)
router.get('/supplies/:id/transactions', equipmentController.getSupplyTransactions);

// سجل معاملات حسب اللاعب (يجب قبل /supplies/:id)
router.get('/supplies/player/:playerId/transactions', equipmentController.getPlayerSupplyTransactions);

// تسجيل معاملة مخزون
router.post(
  '/supplies/:id/transaction',
  requireRole(['club_admin', 'doctor', 'nurse', 'physiotherapist', 'manager']),
  equipmentController.recordSupplyTransaction
);

// تحديث مستلزم
router.put(
  '/supplies/:id',
  requireRole(['club_admin', 'doctor', 'nurse', 'physiotherapist', 'manager']),
  equipmentController.updateSupply
);

// حذف مستلزم
router.delete(
  '/supplies/:id',
  requireRole(['club_admin', 'manager']),
  equipmentController.deleteSupply
);

// تفاصيل مستلزم واحد
router.get('/supplies/:id', equipmentController.getSupplyById);

// ==========================================
// مسارات المعدات الطبية
// ==========================================

// إحصائيات المعدات
router.get('/stats', equipmentController.getEquipmentStats);

// قائمة المعدات
router.get('/', equipmentController.getAllEquipment);

// إضافة معدة
router.post(
  '/',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  equipmentController.createEquipment
);

// سجلات الصيانة لمعدة (يجب قبل /:id)
router.get('/:id/maintenance', equipmentController.getMaintenanceRecords);

// إضافة سجل صيانة
router.post(
  '/:id/maintenance',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  equipmentController.addMaintenanceRecord
);

// تحديث معدة
router.put(
  '/:id',
  requireRole(['club_admin', 'doctor', 'physiotherapist', 'manager']),
  equipmentController.updateEquipment
);

// حذف معدة
router.delete(
  '/:id',
  requireRole(['club_admin', 'manager']),
  equipmentController.deleteEquipment
);

// تفاصيل معدة (يجب أن تكون أخيراً)
router.get('/:id', equipmentController.getEquipmentById);

module.exports = router;
