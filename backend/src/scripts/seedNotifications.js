const mysql = require('mysql2');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

async function seedNotifications() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    });
    console.log('✅ Connected to database');

    await connection.execute('DELETE FROM notifications WHERE club_id = 1');
    console.log('🧹 Cleared existing notifications');

    const now = new Date();
    const clubId = 1;
    const userId = 1;

    const sampleNotifications = [
      {
        club_id: clubId,
        user_id: userId,
        type: 'injury',
        title: 'إصابة جديدة مسجلة',
        body: 'تم تسجيل إصابة جديدة للاعب محمد النمر - تمزق عضلي في الفخذ الخلفي',
        related_entity_type: 'Injury',
        related_entity_id: 1,
        is_read: 0,
        priority: 'high',
        created_at: new Date(now.getTime() - 1000 * 60 * 5),
      },
      {
        club_id: clubId,
        user_id: userId,
        type: 'equipment',
        title: 'معدات تحتاج صيانة',
        body: 'جهاز العلاج الطبيعي يحتاج صيانة دورية - يرجى التحقق',
        related_entity_type: 'Equipment',
        related_entity_id: 1,
        is_read: 0,
        priority: 'medium',
        created_at: new Date(now.getTime() - 1000 * 60 * 30),
      },
      {
        club_id: clubId,
        user_id: userId,
        type: 'supplies',
        title: 'مستلزمات تقترب من النفاد',
        body: 'كريم مسكن - المخزون الحالي: 5 أنبوب (أقل من الحد الأدنى)',
        related_entity_type: 'Supply',
        related_entity_id: 1,
        is_read: 0,
        priority: 'medium',
        created_at: new Date(now.getTime() - 1000 * 60 * 60),
      },
      {
        club_id: clubId,
        user_id: userId,
        type: 'appointment',
        title: 'موعد طبي غداً',
        body: 'موعد فحص طبي للاعب ياسر عبدالله الساعة 10:00 صباحاً',
        related_entity_type: 'Appointment',
        related_entity_id: 1,
        is_read: 0,
        priority: 'medium',
        created_at: new Date(now.getTime() - 1000 * 60 * 120),
      },
      {
        club_id: clubId,
        user_id: userId,
        type: 'rehab',
        title: 'تقدم في برنامج التأهيل',
        body: 'اللاعب خالد سالم أكمل المرحلة 2 من برنامج التأهيل بنجاح (50%)',
        related_entity_type: 'Rehabilitation',
        related_entity_id: 1,
        is_read: 1,
        priority: 'low',
        created_at: new Date(now.getTime() - 1000 * 60 * 180),
      },
      {
        club_id: clubId,
        user_id: userId,
        type: 'system',
        title: 'تم تحديث بيانات اللاعب',
        body: 'تم تحديث بيانات اللاعب أحمد محمد بنجاح',
        related_entity_type: 'Player',
        related_entity_id: 1,
        is_read: 1,
        priority: 'low',
        created_at: new Date(now.getTime() - 1000 * 60 * 240),
      },
      {
        club_id: clubId,
        user_id: userId,
        type: 'performance',
        title: 'تقييم أداء جديد',
        body: 'تم إضافة تقييم أداء جديد للفريق - النتيجة: 85%',
        related_entity_type: 'Performance',
        related_entity_id: 1,
        is_read: 1,
        priority: 'low',
        created_at: new Date(now.getTime() - 1000 * 60 * 300),
      },
      {
        club_id: clubId,
        user_id: userId,
        type: 'injury',
        title: 'إشعار عاجل - اللاعبين',
        body: '3 لاعبين في قائمة المصابین - يرجى المتابعة',
        related_entity_type: null,
        related_entity_id: null,
        is_read: 0,
        priority: 'urgent',
        created_at: new Date(now.getTime() - 1000 * 60 * 60),
      },
    ];

    for (const notif of sampleNotifications) {
      await connection.execute(
        `INSERT INTO notifications 
         (club_id, user_id, type, title, body, related_entity_type, related_entity_id, is_read, priority, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [notif.club_id, notif.user_id, notif.type, notif.title, notif.body, notif.related_entity_type, notif.related_entity_id, notif.is_read, notif.priority, notif.created_at]
      );
    }

    console.log(`✅ Added ${sampleNotifications.length} notifications`);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedNotifications();