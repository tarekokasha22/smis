'use strict';

module.exports = {
  async up(queryInterface) {
    const players = [
      // حراس المرمى
      { club_id: 1, name: 'محمد العويس', number: 1, position: 'حارس مرمى', status: 'ready', nationality: 'سعودي', height: 188, weight: 82, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'عبدالله الجدعاني', number: 31, position: 'حارس مرمى', status: 'ready', nationality: 'سعودي', height: 185, weight: 80, blood_type: 'A+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'حبيب الوطيان', number: 40, position: 'حارس مرمى', status: 'ready', nationality: 'سعودي', height: 182, weight: 78, blood_type: 'B+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },

      // المدافعون
      { club_id: 1, name: 'ياسر الشهراني', number: 12, position: 'ظهير أيسر', status: 'ready', nationality: 'سعودي', height: 175, weight: 70, blood_type: 'A+', dominant_foot: 'left', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'سعود عبدالحميد', number: 66, position: 'ظهير أيمن', status: 'ready', nationality: 'سعودي', height: 178, weight: 72, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'علي البليهي', number: 5, position: 'قلب دفاع', status: 'injured', nationality: 'سعودي', height: 185, weight: 85, blood_type: 'B+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'كالدون كوليبالي', number: 3, position: 'قلب دفاع', status: 'ready', nationality: 'مالي', height: 192, weight: 88, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'متعب المفرج', number: 17, position: 'قلب دفاع', status: 'ready', nationality: 'سعودي', height: 188, weight: 82, blood_type: 'A+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'حمد اليامي', number: 88, position: 'ظهير أيمن', status: 'rehab', nationality: 'سعودي', height: 176, weight: 71, blood_type: 'AB+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },

      // لاعبو الوسط
      { club_id: 1, name: 'سلمان الفرج', number: 7, position: 'وسط مدافع', status: 'ready', nationality: 'سعودي', height: 180, weight: 74, blood_type: 'A+', dominant_foot: 'left', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'محمد كنو', number: 28, position: 'وسط مدافع', status: 'ready', nationality: 'سعودي', height: 177, weight: 73, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'ناصر الدوسري', number: 16, position: 'وسط', status: 'injured', nationality: 'سعودي', height: 179, weight: 72, blood_type: 'B+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'سالم الدوسري', number: 29, position: 'جناح', status: 'ready', nationality: 'سعودي', height: 176, weight: 70, blood_type: 'A+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'مالكوم', number: 77, position: 'جناح', status: 'ready', nationality: 'برازيلي', height: 171, weight: 68, blood_type: 'O+', dominant_foot: 'left', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'موسى ماريغا', number: 17, position: 'مهاجم', status: 'suspended', nationality: 'مالي', height: 183, weight: 80, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'سعود عبدالله', number: 24, position: 'وسط', status: 'ready', nationality: 'سعودي', height: 175, weight: 69, blood_type: 'A+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'عبدالإله المالكي', number: 6, position: 'وسط مدافع', status: 'rehab', nationality: 'سعودي', height: 178, weight: 74, blood_type: 'B+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },

      // المهاجمون
      { club_id: 1, name: 'ميتروفيتش', number: 9, position: 'مهاجم', status: 'ready', nationality: 'صربي', height: 189, weight: 88, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'عبدالرحمن غريب', number: 18, position: 'مهاجم', status: 'ready', nationality: 'سعودي', height: 182, weight: 76, blood_type: 'A+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'عبدالله الحمدان', number: 14, position: 'مهاجم', status: 'ready', nationality: 'سعودي', height: 181, weight: 75, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'صالح الشهري', number: 11, position: 'مهاجم', status: 'injured', nationality: 'سعودي', height: 187, weight: 84, blood_type: 'B+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'محمد الربيعي', number: 19, position: 'وسط', status: 'ready', nationality: 'سعودي', height: 174, weight: 68, blood_type: 'A+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'نواف العقيدي', number: 33, position: 'حارس مرمى', status: 'ready', nationality: 'سعودي', height: 184, weight: 79, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'هتان باهبري', number: 99, position: 'جناح', status: 'rehab', nationality: 'سعودي', height: 173, weight: 66, blood_type: 'AB+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('players', players);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('players', { club_id: 1 });
  },
};
