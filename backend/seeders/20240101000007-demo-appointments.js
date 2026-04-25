'use strict';

module.exports = {
  async up(queryInterface) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const appointments = [
      // مواعيد اليوم
      {
        club_id: 1,
        player_id: 1,
        doctor_id: 2,
        appointment_type: 'فحص دوري',
        location: 'العيادة الطبية - غرفة 1',
        scheduled_date: today,
        scheduled_time: '09:00',
        duration_minutes: 30,
        status: 'scheduled',
        notes: 'فحص دوري شهري',
        reminder_sent: false,
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 6,
        doctor_id: 2,
        appointment_type: 'متابعة إصابة',
        location: 'العيادة الطبية - غرفة 1',
        scheduled_date: today,
        scheduled_time: '10:30',
        duration_minutes: 45,
        status: 'scheduled',
        notes: 'متابعة تمزق العضلة الخلفية',
        reminder_sent: true,
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 9,
        doctor_id: 3,
        appointment_type: 'جلسة تأهيل',
        location: 'قسم العلاج الطبيعي',
        scheduled_date: today,
        scheduled_time: '14:00',
        duration_minutes: 60,
        status: 'scheduled',
        notes: 'جلسة تأهيل متقدمة',
        reminder_sent: true,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // مواعيد الأيام القادمة
      {
        club_id: 1,
        player_id: 12,
        doctor_id: 2,
        appointment_type: 'متابعة إصابة',
        location: 'العيادة الطبية - غرفة 2',
        scheduled_date: tomorrow,
        scheduled_time: '11:00',
        duration_minutes: 30,
        status: 'scheduled',
        notes: 'متابعة التواء الكاحل',
        reminder_sent: false,
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 17,
        doctor_id: 3,
        appointment_type: 'جلسة تأهيل',
        location: 'قسم العلاج الطبيعي',
        scheduled_date: tomorrow,
        scheduled_time: '15:00',
        duration_minutes: 45,
        status: 'scheduled',
        notes: 'تمارين تقوية للكاحل',
        reminder_sent: false,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // مواعيد منتهية
      {
        club_id: 1,
        player_id: 4,
        doctor_id: 2,
        appointment_type: 'متابعة إصابة',
        location: 'العيادة الطبية - غرفة 1',
        scheduled_date: yesterday,
        scheduled_time: '10:00',
        duration_minutes: 30,
        status: 'completed',
        notes: 'تم التعافي من الكدمة',
        reminder_sent: true,
        created_by: 2,
        created_at: new Date(Date.now() - 172800000),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 22,
        doctor_id: 2,
        appointment_type: 'مراجعة ما قبل الجراحة',
        location: 'العيادة الطبية - غرفة 1',
        scheduled_date: '2024-02-05',
        scheduled_time: '09:30',
        duration_minutes: 60,
        status: 'completed',
        notes: 'تم تحديد موعد الجراحة',
        reminder_sent: true,
        created_by: 2,
        created_at: new Date('2024-02-01'),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('appointments', appointments);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('appointments', { club_id: 1 });
  },
};
