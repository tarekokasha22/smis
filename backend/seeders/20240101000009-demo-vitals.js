'use strict';

module.exports = {
  async up(queryInterface) {
    // إنشاء سجلات مؤشرات حيوية لآخر 30 يوم لعدد من اللاعبين
    const vitals = [];
    const players = [1, 2, 4, 5, 10, 11, 12, 18, 19, 20]; // 10 لاعبين
    const baseHeartRates = [65, 68, 72, 70, 75, 68, 74, 69, 71, 73];
    const baseWeights = [82, 80, 70, 88, 74, 73, 72, 76, 75, 84];

    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      players.forEach((playerId, index) => {
        // تغييرات طفيفة في القراءات
        const hrVariation = Math.floor(Math.random() * 8) - 4;
        const weightVariation = (Math.random() * 0.6) - 0.3;
        const tempVariation = (Math.random() * 0.4) - 0.2;

        vitals.push({
          club_id: 1,
          player_id: playerId,
          recorded_by: 2,
          recorded_at: date,
          heart_rate: baseHeartRates[index] + hrVariation,
          blood_pressure_systolic: 115 + Math.floor(Math.random() * 15),
          blood_pressure_diastolic: 75 + Math.floor(Math.random() * 10),
          temperature: 36.5 + tempVariation,
          spo2: 97 + Math.floor(Math.random() * 3),
          weight: baseWeights[index] + weightVariation,
          height: [188, 185, 175, 192, 180, 177, 179, 182, 181, 187][index],
          bmi: 0,
          resting_hr: baseHeartRates[index] - 5 + hrVariation,
          hrv: 45 + Math.floor(Math.random() * 20),
          sleep_hours: 7 + Math.random() * 2,
          fatigue_level: Math.floor(Math.random() * 5) + 1,
          hydration_status: ['good', 'fair', 'excellent'][Math.floor(Math.random() * 3)],
          notes: '',
          created_at: date,
        });
      });
    }

    await queryInterface.bulkInsert('vitals', vitals);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('vitals', { club_id: 1 });
  },
};
