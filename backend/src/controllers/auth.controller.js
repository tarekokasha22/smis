const { User, Club } = require('../models');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

// تسجيل الدخول
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Club, as: 'club', attributes: ['id', 'name', 'name_en', 'logo_url', 'primary_color', 'is_active'] }],
    });

    if (!user) {
      return ApiResponse.error(res, 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 401, 'AUTH_001');
    }

    if (!user.is_active) {
      return ApiResponse.error(res, 'الحساب غير نشط', 403, 'AUTH_004');
    }

    if (user.club && !user.club.is_active) {
      return ApiResponse.error(res, 'النادي غير نشط', 403, 'AUTH_004');
    }

    const isMatch = await authService.comparePassword(password, user.password_hash);
    if (!isMatch) {
      return ApiResponse.error(res, 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 401, 'AUTH_001');
    }

    // إنشاء الرموز
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    // حفظ رمز التحديث في قاعدة البيانات
    await user.update({
      refresh_token: refreshToken,
      last_login: new Date(),
    });

    return ApiResponse.success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        club: user.club ? {
          id: user.club.id,
          name: user.club.name,
          name_en: user.club.name_en,
          logo_url: user.club.logo_url,
          primary_color: user.club.primary_color,
        } : null,
      },
      accessToken,
      refreshToken,
    }, 'تم تسجيل الدخول بنجاح');

  } catch (error) {
    next(error);
  }
};

// تحديث رمز الوصول
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return ApiResponse.error(res, 'رمز التحديث مطلوب', 400);
    }

    const decoded = authService.verifyRefreshToken(token);
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Club, as: 'club', attributes: ['id', 'name', 'name_en', 'logo_url', 'primary_color'] }],
    });

    if (!user || user.refresh_token !== token || !user.is_active) {
      return ApiResponse.unauthorized(res, 'رمز تحديث غير صالح');
    }

    const newAccessToken = authService.generateAccessToken(user);
    const newRefreshToken = authService.generateRefreshToken(user);

    await user.update({ refresh_token: newRefreshToken });

    return ApiResponse.success(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, 'تم تحديث رمز الوصول');

  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجدداً');
    }
    next(error);
  }
};

// تسجيل الخروج
const logout = async (req, res, next) => {
  try {
    await User.update(
      { refresh_token: null },
      { where: { id: req.user.userId } }
    );
    return ApiResponse.success(res, null, 'تم تسجيل الخروج بنجاح');
  } catch (error) {
    next(error);
  }
};

// الحصول على بيانات المستخدم الحالي
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
      include: [{ model: Club, as: 'club', attributes: ['id', 'name', 'name_en', 'logo_url', 'primary_color'] }],
    });

    if (!user) {
      return ApiResponse.notFound(res, 'المستخدم غير موجود');
    }

    return ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

// تحديث الملف الشخصي
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return ApiResponse.notFound(res, 'المستخدم غير موجود');
    }

    await user.update({ name, phone });

    return ApiResponse.success(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    }, 'تم تحديث الملف الشخصي بنجاح');
  } catch (error) {
    next(error);
  }
};

// تغيير كلمة المرور
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return ApiResponse.notFound(res, 'المستخدم غير موجود');
    }

    const isMatch = await authService.comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return ApiResponse.error(res, 'كلمة المرور الحالية غير صحيحة', 400);
    }

    const hashedPassword = await authService.hashPassword(newPassword);
    await user.update({ password_hash: hashedPassword });

    return ApiResponse.success(res, null, 'تم تغيير كلمة المرور بنجاح');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
