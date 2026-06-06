'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash('Admin@1234', 12);
    const doctorHash = await bcrypt.hash('Doctor@1234', 12);
    const physioHash = await bcrypt.hash('Physio@1234', 12);
    const coachHash = await bcrypt.hash('Coach@1234', 12);
    const managerHash = await bcrypt.hash('Manager@1234', 12);

    await queryInterface.bulkInsert('users', [
      {
        club_id: 1,
        name: 'James Wilson',
        email: 'admin@elitefc.com',
        password_hash: hash,
        role: 'club_admin',
        phone: '07700900001',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'Dr. James Harrison',
        email: 'doctor@elitefc.com',
        password_hash: doctorHash,
        role: 'doctor',
        phone: '07700900002',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'Sarah Mitchell',
        email: 'physio@elitefc.com',
        password_hash: physioHash,
        role: 'physiotherapist',
        phone: '07700900003',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'David Mills',
        email: 'coach@elitefc.com',
        password_hash: coachHash,
        role: 'coach',
        phone: '07700900004',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'Emma Clarke',
        email: 'manager@elitefc.com',
        password_hash: managerHash,
        role: 'manager',
        phone: '07700900005',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { club_id: 1 });
  },
};
