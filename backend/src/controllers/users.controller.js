const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

const ROLE_LABELS = {
  super_admin: 'مدير النظام',
  club_admin: 'مدير النادي',
  doctor: 'طبيب',
  physiotherapist: 'أخصائي علاج طبيعي',
  coach: 'مدرب',
  nurse: 'ممرض',
  nutritionist: 'أخصائي تغذية',
  manager: 'مدير',
  analyst: 'محلل',
};

exports.getAllUsers = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      is_active = '',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = {
      club_id: clubId,
    };

    if (is_active === 'true') {
      whereCondition.is_active = true;
    } else if (is_active === 'false') {
      whereCondition.is_active = false;
    }

    if (role) {
      whereCondition.role = role;
    }

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'name', 'email', 'role', 'phone', 'avatar_url', 'is_active', 'last_login', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: users,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب قائمة المستخدمين',
    });
  }
};

exports.getUsersMeta = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        roles: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
      },
    });
  } catch (error) {
    console.error('Error fetching meta:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب البيانات الوصفية',
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const user = await User.findOne({
      where: { id, club_id: clubId },
      attributes: ['id', 'name', 'email', 'role', 'phone', 'avatar_url', 'is_active', 'last_login', 'created_at'],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب بيانات المستخدم',
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'جميع الحقول مطلوبة',
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'البريد الإلكتروني مستخدم بالفعل',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      club_id: clubId,
      name,
      email,
      password_hash: passwordHash,
      role,
      phone,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
      },
      message: 'تم إضافة المستخدم بنجاح',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء إضافة المستخدم',
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { name, email, role, phone, is_active } = req.body;

    const user = await User.findOne({
      where: { id, club_id: clubId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: id } },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'البريد الإلكتروني مستخدم بالفعل',
        });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      phone: phone !== undefined ? phone : user.phone,
      is_active: is_active !== undefined ? is_active : user.is_active,
    });

    res.json({
      success: true,
      data: user,
      message: 'تم تحديث بيانات المستخدم بنجاح',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تحديث بيانات المستخدم',
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'كلمة المرور مطلوبة',
      });
    }

    const user = await User.findOne({
      where: { id, club_id: clubId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await user.update({ password_hash: passwordHash });

    res.json({
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور',
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const currentUserId = req.user.userId;
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await User.findOne({
      where: { id, club_id: clubId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    if (parseInt(id) === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'لا يمكنك إلغاء تفعيل حسابك الخاص',
      });
    }

    await user.update({ is_active });

    res.json({
      success: true,
      data: user,
      message: is_active ? 'تم تفعيل المستخدم' : 'تم إلغاء تفعيل المستخدم',
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تغيير حالة المستخدم',
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'لا يمكنك حذف حسابك الخاص',
      });
    }

    const user = await User.findOne({
      where: { id, club_id: clubId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    await user.update({ is_active: false });

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء حذف المستخدم',
    });
  }
};