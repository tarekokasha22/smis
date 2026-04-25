const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User, Club } = require('../models');
const ApiResponse = require('../utils/apiResponse');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'رمز الوصول مطلوب');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Club, as: 'club', attributes: ['id', 'name', 'name_en', 'logo_url', 'is_active'] }],
    });

    if (!user || !user.is_active) {
      return ApiResponse.unauthorized(res, 'الحساب غير نشط أو غير موجود');
    }

    if (user.club && !user.club.is_active) {
      return ApiResponse.unauthorized(res, 'النادي غير نشط');
    }

    req.user = {
      userId: user.id,
      clubId: user.club_id,
      role: user.role,
      name: user.name,
      email: user.email,
      club: user.club,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجدداً');
    }
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'رمز وصول غير صالح');
    }
    return ApiResponse.error(res, 'خطأ في التوثيق');
  }
};

module.exports = { verifyToken };
