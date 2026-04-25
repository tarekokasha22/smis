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
        name: 'أحمد المدير',
        email: 'admin@hilal.com',
        password_hash: hash,
        role: 'club_admin',
        phone: '0501234567',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'د. خالد العمري',
        email: 'doctor@hilal.com',
        password_hash: doctorHash,
        role: 'doctor',
        phone: '0507654321',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'سعد الفيصل',
        email: 'physio@hilal.com',
        password_hash: physioHash,
        role: 'physiotherapist',
        phone: '0509876543',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'محمد الشهري',
        email: 'coach@hilal.com',
        password_hash: coachHash,
        role: 'coach',
        phone: '0503456789',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        name: 'عبدالله القحطاني',
        email: 'manager@hilal.com',
        password_hash: managerHash,
        role: 'manager',
        phone: '0505678901',
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
