'use strict';

module.exports = {
  async up(queryInterface) {
    // Player IDs (from demo-players seeder):
    // 1=Jordan Pickford, 4=Trent Alexander-Arnold, 5=Kyle Walker, 9=Ben White,
    // 12=Declan Rice, 14=Jude Bellingham, 15=Phil Foden, 16=Jack Grealish,
    // 18=Bukayo Saka, 19=Harry Kane
    // Recorded by user_id: 2 = Dr. James Harrison

    const vitals = [];
    const playerIds     = [1,   4,   5,   9,   12,  14,  15,  16,  18,  19];
    const baseHeartRates= [63,  67,  66,  65,  65,  62,  67,  65,  66,  64];
    const baseWeights   = [73,  79,  78,  80,  82,  81,  73,  76,  76,  89];
    const heights       = [185, 180, 182, 183, 185, 186, 171, 180, 178, 188];

    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      playerIds.forEach((playerId, index) => {
        const hrVariation     = Math.floor(Math.random() * 8) - 4;
        const weightVariation = (Math.random() * 0.6) - 0.3;
        const tempVariation   = (Math.random() * 0.4) - 0.2;
        const hr              = baseHeartRates[index] + hrVariation;
        const wt              = Math.round((baseWeights[index] + weightVariation) * 10) / 10;
        const ht              = heights[index];

        vitals.push({
          club_id: 1,
          player_id: playerId,
          recorded_by: 2,
          recorded_at: date,
          heart_rate: hr,
          blood_pressure_systolic:  115 + Math.floor(Math.random() * 15),
          blood_pressure_diastolic:  74 + Math.floor(Math.random() * 10),
          temperature: Math.round((36.5 + tempVariation) * 10) / 10,
          spo2: 97 + Math.floor(Math.random() * 3),
          weight: wt,
          height: ht,
          bmi: Math.round((wt / ((ht / 100) ** 2)) * 10) / 10,
          resting_hr: hr - 5,
          hrv: 45 + Math.floor(Math.random() * 30),
          sleep_hours: Math.round((7 + Math.random() * 2) * 10) / 10,
          fatigue_level: Math.floor(Math.random() * 5) + 1,
          hydration_status: ['excellent', 'good', 'good', 'fair'][Math.floor(Math.random() * 4)],
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
