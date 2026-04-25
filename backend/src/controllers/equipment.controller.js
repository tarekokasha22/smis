const { Op } = require('sequelize');
const { Equipment, EquipmentMaintenance, Supply, SupplyTransaction, User, Player, sequelize } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { notifyLowStock, notifyEquipmentMaintenance, notifySupplyDispensed } = require('../services/notification.service');

// ==========================================
// ====== المعدات الطبية ======
// ==========================================

// الحصول على قائمة المعدات
exports.getAllEquipment = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { club_id: clubId };

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { serial_number: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: equipment } = await Equipment.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: equipment,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات المعدات');
  }
};

// إحصائيات المعدات
exports.getEquipmentStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    const totalEquipment = await Equipment.count({ where: { club_id: clubId } });
    const byStatus = await Equipment.findAll({
      where: { club_id: clubId },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // المعدات التي تحتاج صيانة قريباً (خلال 30 يوم)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const needsMaintenance = await Equipment.count({
      where: {
        club_id: clubId,
        next_maintenance_date: { [Op.lte]: thirtyDaysFromNow, [Op.ne]: null },
        status: { [Op.ne]: 'out_of_service' },
      },
    });

    // المعدات منتهية الضمان
    const warrantyExpired = await Equipment.count({
      where: {
        club_id: clubId,
        warranty_expiry: { [Op.lt]: new Date(), [Op.ne]: null },
      },
    });

    // آخر عمليات الصيانة
    const recentMaintenance = await EquipmentMaintenance.findAll({
      where: { club_id: clubId },
      include: [{ model: Equipment, as: 'equipment', attributes: ['id', 'name', 'brand'] }],
      order: [['performed_at', 'DESC']],
      limit: 5,
    });

    const statusMap = {};
    byStatus.forEach((s) => { statusMap[s.status] = parseInt(s.count); });

    return res.json({
      success: true,
      data: {
        total: totalEquipment,
        byStatus: statusMap,
        needsMaintenance,
        warrantyExpired,
        recentMaintenance,
      },
    });
  } catch (error) {
    console.error('Error fetching equipment stats:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب إحصائيات المعدات');
  }
};

// الحصول على تفاصيل معدة
exports.getEquipmentById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const equipment = await Equipment.findOne({
      where: { id, club_id: clubId },
      include: [
        {
          model: EquipmentMaintenance,
          as: 'maintenanceRecords',
          order: [['performed_at', 'DESC']],
          limit: 10,
          include: [{ model: User, as: 'performedByUser', attributes: ['id', 'name'], required: false }],
        },
      ],
    });

    if (!equipment) {
      return ApiResponse.notFound(res, 'المعدة غير موجودة');
    }

    return ApiResponse.success(res, equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات المعدة');
  }
};

// إنشاء معدة جديدة
exports.createEquipment = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      name, purpose, brand, serial_number, model, location,
      status, purchase_date, purchase_price, warranty_expiry,
      last_maintenance_date, next_maintenance_date, requires_calibration,
      calibration_date, notes,
    } = req.body;

    if (!name) {
      return ApiResponse.validationError(res, [], 'اسم المعدة مطلوب');
    }

    const equipment = await Equipment.create({
      club_id: clubId,
      name, purpose, brand, serial_number, model, location,
      status: status || 'good',
      purchase_date: purchase_date || null,
      purchase_price: purchase_price || null,
      warranty_expiry: warranty_expiry || null,
      last_maintenance_date: last_maintenance_date || null,
      next_maintenance_date: next_maintenance_date || null,
      requires_calibration: requires_calibration || false,
      calibration_date: calibration_date || null,
      notes: notes || null,
      usage_count: 0,
    });

    return ApiResponse.created(res, equipment, 'تمت إضافة المعدة بنجاح');
  } catch (error) {
    console.error('Error creating equipment:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إضافة المعدة');
  }
};

// تحديث معدة
exports.updateEquipment = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const equipment = await Equipment.findOne({ where: { id, club_id: clubId } });
    if (!equipment) {
      return ApiResponse.notFound(res, 'المعدة غير موجودة');
    }

    const updateData = { ...req.body };
    delete updateData.club_id;
    delete updateData.id;

    await equipment.update(updateData);
    return ApiResponse.success(res, equipment, 'تم تحديث بيانات المعدة بنجاح');
  } catch (error) {
    console.error('Error updating equipment:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث المعدة');
  }
};

// حذف معدة
exports.deleteEquipment = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const equipment = await Equipment.findOne({ where: { id, club_id: clubId } });
    if (!equipment) {
      return ApiResponse.notFound(res, 'المعدة غير موجودة');
    }

    await EquipmentMaintenance.destroy({ where: { equipment_id: id } });
    await equipment.destroy();

    return ApiResponse.success(res, null, 'تم حذف المعدة بنجاح');
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف المعدة');
  }
};

// ==========================================
// ====== سجلات الصيانة ======
// ==========================================

// الحصول على سجلات الصيانة لمعدة
exports.getMaintenanceRecords = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const equipment = await Equipment.findOne({ where: { id, club_id: clubId } });
    if (!equipment) {
      return ApiResponse.notFound(res, 'المعدة غير موجودة');
    }

    const records = await EquipmentMaintenance.findAll({
      where: { equipment_id: id, club_id: clubId },
      order: [['performed_at', 'DESC']],
    });

    return ApiResponse.success(res, records);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب سجلات الصيانة');
  }
};

// إضافة سجل صيانة
exports.addMaintenanceRecord = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const { id: equipment_id } = req.params;
    const { maintenance_type, performed_at, cost, description, next_due, status } = req.body;

    const equipment = await Equipment.findOne({ where: { id: equipment_id, club_id: clubId } });
    if (!equipment) {
      return ApiResponse.notFound(res, 'المعدة غير موجودة');
    }

    if (!maintenance_type || !performed_at) {
      return ApiResponse.validationError(res, [], 'نوع الصيانة والتاريخ مطلوبان');
    }

    const record = await EquipmentMaintenance.create({
      club_id: clubId,
      equipment_id,
      performed_by: userId,
      maintenance_type,
      performed_at,
      cost: cost || null,
      description: description || null,
      next_due: next_due || null,
      status: status || 'completed',
    });

    // تحديث تاريخ آخر صيانة والقادمة على المعدة
    await equipment.update({
      last_maintenance_date: performed_at,
      next_maintenance_date: next_due || equipment.next_maintenance_date,
    });

    notifyEquipmentMaintenance(clubId, equipment.name, equipment_id).catch(() => {});

    return ApiResponse.created(res, record, 'تم تسجيل سجل الصيانة بنجاح');
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل الصيانة');
  }
};

// ==========================================
// ====== المستلزمات والأدوية ======
// ==========================================

// الحصول على قائمة المستلزمات
exports.getAllSupplies = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      lowStock = '',
      sortBy = 'name',
      sortOrder = 'ASC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { club_id: clubId };

    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { manufacturer: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
      ];
    }
    if (lowStock === 'true') {
      where[Op.and] = [sequelize.literal('`Supply`.`total_quantity` <= `Supply`.`reorder_level`')];
    }

    const { count, rows: supplies } = await Supply.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: supplies,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching supplies:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات المستلزمات');
  }
};

// إحصائيات المستلزمات
exports.getSuppliesStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    const totalSupplies = await Supply.count({ where: { club_id: clubId } });

    // المستلزمات منخفضة المخزون
    const lowStock = await Supply.count({
      where: {
        club_id: clubId,
        [Op.and]: [sequelize.literal('`Supply`.`total_quantity` <= `Supply`.`reorder_level`')],
      },
    });

    // المستلزمات منتهية الصلاحية
    const expired = await Supply.count({
      where: {
        club_id: clubId,
        expiry_date: { [Op.lt]: new Date(), [Op.ne]: null },
      },
    });

    // تصنيف حسب الفئة
    const byCategory = await Supply.findAll({
      where: { club_id: clubId },
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    const categoryMap = {};
    byCategory.forEach((c) => { categoryMap[c.category] = parseInt(c.count); });

    return res.json({
      success: true,
      data: {
        total: totalSupplies,
        lowStock,
        expired,
        byCategory: categoryMap,
      },
    });
  } catch (error) {
    console.error('Error fetching supplies stats:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب إحصائيات المستلزمات');
  }
};

// إنشاء مستلزم
exports.createSupply = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      name, category, unit, total_quantity, used_quantity, reorder_level,
      expiry_date, storage_location, purpose, manufacturer, barcode,
      is_controlled_substance, requires_prescription, notes,
    } = req.body;

    if (!name || !category) {
      return ApiResponse.validationError(res, [], 'اسم المستلزم والفئة مطلوبان');
    }

    const supply = await Supply.create({
      club_id: clubId,
      name, category, unit,
      total_quantity: total_quantity || 0,
      used_quantity: used_quantity || 0,
      reorder_level: reorder_level || 10,
      expiry_date: expiry_date || null,
      storage_location: storage_location || null,
      purpose: purpose || null,
      manufacturer: manufacturer || null,
      barcode: barcode || null,
      is_controlled_substance: is_controlled_substance || false,
      requires_prescription: requires_prescription || false,
      notes: notes || null,
    });

    return ApiResponse.created(res, supply, 'تمت إضافة المستلزم بنجاح');
  } catch (error) {
    console.error('Error creating supply:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء إضافة المستلزم');
  }
};

// تحديث مستلزم
exports.updateSupply = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const supply = await Supply.findOne({ where: { id, club_id: clubId } });
    if (!supply) {
      return ApiResponse.notFound(res, 'المستلزم غير موجود');
    }

    const updateData = { ...req.body };
    delete updateData.club_id;
    delete updateData.id;

    await supply.update(updateData);
    return ApiResponse.success(res, supply, 'تم تحديث بيانات المستلزم بنجاح');
  } catch (error) {
    console.error('Error updating supply:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث المستلزم');
  }
};

// حذف مستلزم
exports.deleteSupply = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const supply = await Supply.findOne({ where: { id, club_id: clubId } });
    if (!supply) {
      return ApiResponse.notFound(res, 'المستلزم غير موجود');
    }

    await SupplyTransaction.destroy({ where: { supply_id: id } });
    await supply.destroy();

    return ApiResponse.success(res, null, 'تم حذف المستلزم بنجاح');
  } catch (error) {
    console.error('Error deleting supply:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف المستلزم');
  }
};

// الحصول على تفاصيل مستلزم واحد مع آخر المعاملات
exports.getSupplyById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const supply = await Supply.findOne({ where: { id, club_id: clubId } });
    if (!supply) {
      return ApiResponse.notFound(res, 'المستلزم غير موجود');
    }

    // جلب آخر 10 معاملات مع اسم المستخدم
    const transactions = await SupplyTransaction.findAll({
      where: { supply_id: id, club_id: clubId },
      include: [
        { model: User, as: 'performer', attributes: ['id', 'name'], foreignKey: 'performed_by', required: false },
      ],
      order: [['transaction_at', 'DESC']],
      limit: 10,
    });

    return ApiResponse.success(res, { supply, transactions });
  } catch (error) {
    console.error('Error fetching supply by id:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب بيانات المستلزم');
  }
};

// الحصول على سجل معاملات مستلزم (مع ترقيم الصفحات)
exports.getSupplyTransactions = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supply = await Supply.findOne({ where: { id, club_id: clubId } });
    if (!supply) {
      return ApiResponse.notFound(res, 'المستلزم غير موجود');
    }

    const { count, rows: transactions } = await SupplyTransaction.findAndCountAll({
      where: { supply_id: id, club_id: clubId },
      order: [['transaction_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: transactions,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching supply transactions:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب معاملات المستلزم');
  }
};

// الحصول على سجل معاملات حسب اللاعب
exports.getPlayerSupplyTransactions = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { playerId } = req.params;
    const { limit = 50 } = req.query;

    const transactions = await SupplyTransaction.findAll({
      where: { club_id: clubId, player_id: playerId },
      include: [{ model: Supply, as: 'supply', attributes: ['id', 'name', 'category', 'unit'] }],
      order: [['transaction_at', 'DESC']],
      limit: parseInt(limit),
    });

    return ApiResponse.success(res, transactions);
  } catch (error) {
    console.error('Error fetching player supply transactions:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب سجل أدوية اللاعب');
  }
};

// تسجيل معاملة مخزون (إضافة / صرف)
exports.recordSupplyTransaction = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const { id: supply_id } = req.params;
    const { transaction_type, quantity, notes, player_id } = req.body;

    if (!['dispense', 'restock', 'adjustment', 'expired_disposal'].includes(transaction_type)) {
      return ApiResponse.validationError(res, [], 'نوع المعاملة غير صالح');
    }

    const supply = await Supply.findOne({ where: { id: supply_id, club_id: clubId } });
    if (!supply) {
      return ApiResponse.notFound(res, 'المستلزم غير موجود');
    }

    if (!quantity || parseInt(quantity) <= 0) {
      return ApiResponse.validationError(res, [], 'الكمية مطلوبة ويجب أن تكون أكبر من صفر');
    }

    const qty = parseInt(quantity);

    // تحديث الكمية
    if (transaction_type === 'restock') {
      await supply.increment('total_quantity', { by: qty });
    } else if (transaction_type === 'dispense' || transaction_type === 'expired_disposal') {
      if (supply.total_quantity < qty) {
        return ApiResponse.validationError(res, [], 'الكمية المطلوبة أكبر من المتاح');
      }
      await supply.increment('used_quantity', { by: qty });
      await supply.decrement('total_quantity', { by: qty });
    }

    await supply.reload();

    const transaction = await SupplyTransaction.create({
      club_id: clubId,
      supply_id,
      performed_by: userId,
      player_id: player_id || null,
      transaction_type,
      quantity_change: transaction_type === 'restock' ? qty : -qty,
      remaining_after: supply.total_quantity,
      notes: notes || null,
    });

    // إشعار عند صرف دواء للاعب
    if (transaction_type === 'dispense' && player_id) {
      Player.findByPk(player_id, { attributes: ['name'] }).then(player => {
        if (player) notifySupplyDispensed(clubId, supply.name, player.name, qty, supply_id).catch(() => {});
      }).catch(() => {});
    }

    // إشعار عند نفاد المخزون
    if (['dispense', 'expired_disposal'].includes(transaction_type) && supply.total_quantity <= supply.reorder_level) {
      notifyLowStock(clubId, supply.name, supply.total_quantity, supply_id).catch(() => {});
    }

    return ApiResponse.created(res, { transaction, supply }, 'تمت العملية بنجاح');
  } catch (error) {
    console.error('Error recording supply transaction:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تسجيل المعاملة');
  }
};
