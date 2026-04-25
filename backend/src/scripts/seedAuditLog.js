const mysql = require('mysql2/promise');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

async function seedAuditLogs() {
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

    await connection.execute('DELETE FROM audit_logs WHERE club_id = 1');
    console.log('🧹 Cleared existing logs');

    const now = new Date();
    const clubId = 1;

    const sampleLogs = [
      {
        user_id: 1,
        user_name: 'أحمد محمد',
        action: 'CREATE',
        entity_type: 'Player',
        entity_id: 1,
        new_values: JSON.stringify({ name: 'محمد النمر', number: 10, position: 'مهاجم', nationality: 'سعودي', height: 180, weight: 75 }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      },
      {
        user_id: 1,
        user_name: 'أحمد محمد',
        action: 'CREATE',
        entity_type: 'Player',
        entity_id: 2,
        new_values: JSON.stringify({ name: 'خالد سالم', number: 29, position: 'جناح أيسر', nationality: 'سعودي', height: 174, weight: 71 }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 1.5),
      },
      {
        user_id: 2,
        user_name: 'د. خالد طبيب',
        action: 'CREATE',
        entity_type: 'Injury',
        entity_id: 1,
        new_values: JSON.stringify({ player_id: 1, injury_type: 'تمزق عضلي', body_area: 'الفخذ الخلفي', severity: 'moderate', expected_recovery_days: 14 }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 60),
      },
      {
        user_id: 2,
        user_name: 'د. خالد طبيب',
        action: 'UPDATE',
        entity_type: 'Injury',
        entity_id: 1,
        new_values: JSON.stringify({ status: 'recovering', notes: 'جاري العلاج الطبيعي' }),
        old_values: JSON.stringify({ status: 'active' }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 45),
      },
      {
        user_id: 3,
        user_name: 'كمال أخصائي علاج طبيعي',
        action: 'CREATE',
        entity_type: 'Rehabilitation',
        entity_id: 1,
        new_values: JSON.stringify({ player_id: 1, injury_id: 1, program_name: 'برنامج تأهيل تمزق الفخذ', phase: 1, progress_pct: 0 }),
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 30),
      },
      {
        user_id: 3,
        user_name: 'كمال أخصائي علاج طبيعي',
        action: 'UPDATE',
        entity_type: 'Rehabilitation',
        entity_id: 1,
        new_values: JSON.stringify({ progress_pct: 25, phase: 2 }),
        old_values: JSON.stringify({ progress_pct: 0, phase: 1 }),
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 20),
      },
      {
        user_id: 1,
        user_name: 'أحمد محمد',
        action: 'CREATE',
        entity_type: 'Equipment',
        entity_id: 1,
        new_values: JSON.stringify({ name: 'جهاز علاج طبيعي', purpose: 'علاج إصابات العضلات', brand: 'PhysioTech', status: 'excellent' }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 15),
      },
      {
        user_id: 1,
        user_name: 'أحمد محمد',
        action: 'CREATE',
        entity_type: 'Supply',
        entity_id: 1,
        new_values: JSON.stringify({ name: 'كريم مسكن', category: 'medication', unit: 'أنبوب', total_quantity: 50 }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 10),
      },
      {
        user_id: 2,
        user_name: 'د. خالد طبيب',
        action: 'CREATE',
        entity_type: 'Vital',
        entity_id: 1,
        new_values: JSON.stringify({ player_id: 1, heart_rate: 72, blood_pressure_systolic: 120, blood_pressure_diastolic: 80, spo2: 98, weight: 75.5 }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 5),
      },
      {
        user_id: 1,
        user_name: 'أحمد محمد',
        action: 'UPDATE',
        entity_type: 'Player',
        entity_id: 1,
        new_values: JSON.stringify({ status: 'injured' }),
        old_values: JSON.stringify({ status: 'ready' }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60 * 3),
      },
      {
        user_id: 1,
        user_name: 'أحمد محمد',
        action: 'DELETE',
        entity_type: 'Supply',
        entity_id: 2,
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 60),
      },
      {
        user_id: 2,
        user_name: 'د. خالد طبيب',
        action: 'CREATE',
        entity_type: 'Appointment',
        entity_id: 1,
        new_values: JSON.stringify({ player_id: 1, doctor_id: 2, appointment_type: 'فحص طبي', scheduled_date: now.toISOString().split('T')[0], scheduled_time: '10:00' }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(now.getTime() - 1000 * 30),
      },
    ];

    for (const log of sampleLogs) {
      await connection.execute(
        `INSERT INTO audit_logs 
         (club_id, user_id, user_name, action, entity_type, entity_id, new_values, old_values, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clubId, log.user_id, log.user_name, log.action, log.entity_type, log.entity_id, log.new_values || null, log.old_values || null, log.ip_address, log.user_agent, log.created_at]
      );
    }

    console.log(`✅ Added ${sampleLogs.length} audit logs`);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedAuditLogs();