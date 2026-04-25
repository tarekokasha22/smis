const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

async function seedUsers() {
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

    await connection.execute('DELETE FROM users WHERE club_id = 1');
    console.log('🧹 Cleared existing users');

    const now = new Date();
    const clubId = 1;
    const defaultPassword = await bcrypt.hash('123456', 12);

    const sampleUsers = [
      { name: 'أحمد محمد', email: 'ahmed@hilal.fc', role: 'club_admin', phone: '+966501234567', is_active: 1 },
      { name: 'د. خالد طبيب', email: 'dr.khalid@hilal.fc', role: 'doctor', phone: '+966501234568', is_active: 1 },
      { name: 'كمال أخصائي علاج طبيعي', email: 'kamal@hilal.fc', role: 'physiotherapist', phone: '+966501234569', is_active: 1 },
      { name: 'سامي مدرب', email: 'sami@hilal.fc', role: 'coach', phone: '+966501234570', is_active: 1 },
      { name: 'نورة ممرضة', email: 'norah@hilal.fc', role: 'nurse', phone: '+966501234571', is_active: 1 },
      { name: 'فهد أخصائي تغذية', email: 'fahad@hilal.fc', role: 'nutritionist', phone: '+966501234572', is_active: 1 },
      { name: 'عمر مدير', email: 'omar@hilal.fc', role: 'manager', phone: '+966501234573', is_active: 1 },
      { name: 'ياسر محلل', email: 'yasser@hilal.fc', role: 'analyst', phone: '+966501234574', is_active: 1 },
    ];

    for (const user of sampleUsers) {
      await connection.execute(
        `INSERT INTO users (club_id, name, email, password_hash, role, phone, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clubId, user.name, user.email, defaultPassword, user.role, user.phone, user.is_active, now, now]
      );
    }

    console.log(`✅ Added ${sampleUsers.length} users`);
    console.log('🔑 Default password for all users: 123456');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedUsers();