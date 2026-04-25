const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');

const SALT_ROUNDS = 12;

// إنشاء رمز الوصول
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, clubId: user.club_id, role: user.role },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );
};

// إنشاء رمز التحديث
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );
};

// التحقق من رمز التحديث
const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshToken.secret);
};

// تشفير كلمة المرور
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// مقارنة كلمة المرور
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
};
