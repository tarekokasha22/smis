require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { sequelize } = require('./src/models');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// تهيئة Socket.io
initSocket(server);

// بدء التشغيل
const start = async () => {
  try {
    // اختبار اتصال قاعدة البيانات
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // مزامنة النماذج (في بيئة التطوير فقط)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ تم مزامنة النماذج');
    }

    server.listen(PORT, () => {
      console.log(`🚀 SMIS API يعمل على المنفذ ${PORT}`);
      console.log(`📍 http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ خطأ في بدء التشغيل:', error.message);
    process.exit(1);
  }
};

start();
