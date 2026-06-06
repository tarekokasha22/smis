'use strict';

module.exports = {
  async up(queryInterface) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().split('T')[0];

    // Player IDs (from demo-players seeder):
    // 6 = John Stones, 10 = Reece James, 19 = Harry Kane, 15 = Phil Foden
    // 14 = Jude Bellingham, 18 = Bukayo Saka, 4 = Trent Alexander-Arnold
    // User IDs: 2 = Dr. James Harrison, 3 = Sarah Mitchell (physio)

    const appointments = [
      // Today's appointments
      {
        club_id: 1,
        player_id: 6,        // John Stones
        doctor_id: 2,
        appointment_type: 'Injury Follow-up',
        location: 'Medical Room A',
        scheduled_date: today,
        scheduled_time: '09:00',
        duration_minutes: 45,
        status: 'scheduled',
        notes: 'Weekly hamstring assessment — check progress on grade II strain',
        reminder_sent: true,
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 19,       // Harry Kane
        doctor_id: 2,
        appointment_type: 'Routine Check',
        location: 'Medical Room B',
        scheduled_date: today,
        scheduled_time: '10:30',
        duration_minutes: 30,
        status: 'scheduled',
        notes: 'Monthly routine medical check — ankle sprain follow-up included',
        reminder_sent: true,
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 10,       // Reece James
        doctor_id: 3,
        appointment_type: 'Physiotherapy Session',
        location: 'Physio Suite',
        scheduled_date: today,
        scheduled_time: '14:00',
        duration_minutes: 60,
        status: 'scheduled',
        notes: 'ACL rehabilitation — phase 2 strength and stability exercises',
        reminder_sent: false,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Upcoming appointments
      {
        club_id: 1,
        player_id: 15,       // Phil Foden
        doctor_id: 3,
        appointment_type: 'Physiotherapy Session',
        location: 'Physio Suite',
        scheduled_date: tomorrow,
        scheduled_time: '10:00',
        duration_minutes: 60,
        status: 'scheduled',
        notes: 'Calf rehabilitation — phase 4 return-to-play exercises',
        reminder_sent: false,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 14,       // Jude Bellingham
        doctor_id: 2,
        appointment_type: 'Pre-match Assessment',
        location: 'Medical Room A',
        scheduled_date: tomorrow,
        scheduled_time: '15:00',
        duration_minutes: 30,
        status: 'scheduled',
        notes: 'Standard pre-match fitness clearance',
        reminder_sent: false,
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Completed appointments
      {
        club_id: 1,
        player_id: 6,        // John Stones
        doctor_id: 2,
        appointment_type: 'Injury Follow-up',
        location: 'Medical Room A',
        scheduled_date: yesterday,
        scheduled_time: '09:30',
        duration_minutes: 45,
        status: 'completed',
        notes: 'Initial hamstring assessment — grade II confirmed via ultrasound',
        reminder_sent: true,
        created_by: 2,
        created_at: new Date(Date.now() - 172800000),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 18,       // Bukayo Saka
        doctor_id: 2,
        appointment_type: 'Post-match Review',
        location: 'Medical Room B',
        scheduled_date: daysAgo(3),
        scheduled_time: '16:00',
        duration_minutes: 30,
        status: 'completed',
        notes: 'Post-match review after derby — no concerns identified',
        reminder_sent: true,
        created_by: 2,
        created_at: new Date(Date.now() - 4 * 86400000),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 4,        // Trent Alexander-Arnold
        doctor_id: 3,
        appointment_type: 'Physiotherapy Session',
        location: 'Physio Suite',
        scheduled_date: daysAgo(5),
        scheduled_time: '11:00',
        duration_minutes: 45,
        status: 'completed',
        notes: 'Thigh rehabilitation — final clearance session before return to full training',
        reminder_sent: true,
        created_by: 3,
        created_at: new Date(Date.now() - 6 * 86400000),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('appointments', appointments);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('appointments', { club_id: 1 });
  },
};
