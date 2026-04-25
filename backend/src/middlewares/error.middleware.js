const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// معالج الأخطاء العام
const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // أخطاء Sequelize
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'البيانات المدخلة غير صحيحة',
      details,
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ERROR',
      message: 'هذا السجل موجود مسبقاً',
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'REFERENCE_ERROR',
      message: 'لا يمكن حذف هذا السجل لارتباطه ببيانات أخرى',
    });
  }

  // خطأ Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'FILE_002',
      message: 'حجم الملف يتجاوز الحد المسموح (20MB)',
    });
  }

  // خطأ عام
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'خطأ في الخادم، الرجاء المحاولة لاحقاً',
  });
};

module.exports = { errorHandler, logger };
