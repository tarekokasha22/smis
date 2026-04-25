require('dotenv').config({ path: __dirname + '/../.env' });
const { sequelize, Player, BodyMeasurement, User } = require('../src/models');

async function seedMeasurements() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Find a club_id
    const clubId = 1; // standard
    // Find players
    const players = await Player.findAll({ where: { club_id: clubId }, limit: 3 });
    if (players.length === 0) {
      console.log('No players found to add measurements to');
      process.exit(1);
    }
    
    // Find an admin user to be recording
    const user = await User.findOne({ where: { club_id: clubId, role: 'doctor' } });
    const recordingUserId = user ? user.id : 1;

    console.log(`Adding example measurements for ${players.length} players...`);

    const measurements = [];
    for (const player of players) {
      // 1st Measurement (last month)
      const d1 = new Date();
      d1.setDate(d1.getDate() - 30);
      measurements.push({
        club_id: clubId,
        player_id: player.id,
        recorded_by: recordingUserId,
        measured_at: d1,
        weight: player.weight || 75.5,
        body_fat_pct: 18.5,
        muscle_mass_kg: 35.0,
        inbody_score: 75,
        chest_cm: 100,
        waist_cm: 80,
        notes: 'قياس أولي للموسم'
      });

      // 2nd Measurement (now)
      const d2 = new Date();
      measurements.push({
        club_id: clubId,
        player_id: player.id,
        recorded_by: recordingUserId,
        measured_at: d2,
        weight: (player.weight || 75.5) - 1.5, // lost 1.5 kg
        body_fat_pct: 16.0,
        muscle_mass_kg: 36.5, // gained 1.5 kg muscle
        inbody_score: 82,
        chest_cm: 99,
        waist_cm: 77,
        notes: 'تحسن ملحوظ في الكتلة العضلية وانخفاض نسبة الدهون'
      });
    }

    await BodyMeasurement.bulkCreate(measurements);
    console.log('Successfully added example measurements!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding measurements:', error);
    process.exit(1);
  }
}

seedMeasurements();
