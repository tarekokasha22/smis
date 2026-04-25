require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler } = require('./middlewares/error.middleware');
const { globalAuditLog } = require('./middlewares/audit.middleware');

const app = express();

// ==========================================
// Middleware العام
// ==========================================

// الأمان - السماح بعرض الملفات المرفوعة مباشرة
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ضغط الاستجابات
app.use(compression());

// تسجيل الطلبات
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// تحليل JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ملفات ثابتة (الملفات المرفوعة)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ==========================================
// تحديد معدل الطلبات
// ==========================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  message: {
    success: false,
    error: 'RATE_LIMIT',
    message: 'تم تجاوز الحد المسموح من المحاولات، الرجاء المحاولة لاحقاً',
  },
});

// ==========================================
// المسارات
// ==========================================

// تسجيل النشاط تلقائياً لجميع العمليات
app.use('/api/v1', globalAuditLog);

app.use('/api/v1/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));
app.use('/api/v1/players', require('./routes/players.routes'));
app.use('/api/v1/injuries', require('./routes/injuries.routes'));
app.use('/api/v1/vitals', require('./routes/vitals.routes'));
app.use('/api/v1/rehabilitation', require('./routes/rehabilitation.routes'));
app.use('/api/v1/files', require('./routes/files.routes'));
app.use('/api/v1/equipment', require('./routes/equipment.routes'));
app.use('/api/v1/reports', require('./routes/reports.routes'));
app.use('/api/v1/measurements', require('./routes/measurements.routes'));
app.use('/api/v1/audit', require('./routes/audit.routes'));
app.use('/api/v1/users', require('./routes/users.routes'));
app.use('/api/v1/notifications', require('./routes/notifications.routes'));
app.use('/api/v1/settings', require('./routes/settings.routes'));
app.use('/api/v1/appointments', require('./routes/appointments.routes'));
app.use('/api/v1/performance', require('./routes/performance.routes'));
app.use('/api/v1/statistics', require('./routes/statistics.routes'));

// مسار فحص الحالة
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SMIS API يعمل بنجاح',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// مسار غير موجود
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'المسار المطلوب غير موجود',
  });
});

// معالج الأخطاء العام
app.use(errorHandler);

module.exports = app;
