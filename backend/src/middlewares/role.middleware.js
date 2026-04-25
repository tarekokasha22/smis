const ApiResponse = require('../utils/apiResponse');

// التحقق من الصلاحيات حسب الدور
const requireRole = (...allowedRoles) => {
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res);
    }

    // super_admin يملك صلاحية لكل شيء
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'ليس لديك صلاحية للوصول لهذا المحتوى');
    }

    next();
  };
};

module.exports = { requireRole };
