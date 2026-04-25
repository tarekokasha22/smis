const ApiResponse = require('../utils/apiResponse');

// حارس النادي - كل طلب يجب أن يكون ضمن نطاق النادي
const verifyClubAccess = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }

  if (!req.user.clubId) {
    return ApiResponse.forbidden(res, 'هذا الحساب غير مرتبط بنادي');
  }

  // إضافة club_id للاستعلامات تلقائياً
  req.clubScope = { club_id: req.user.clubId };

  next();
};

module.exports = { verifyClubAccess };
