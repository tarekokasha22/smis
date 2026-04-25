const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const {
  sequelize,
  Club,
  User,
  Player,
  Injury,
  Vital,
  Rehabilitation,
  RehabSession,
  Equipment,
  EquipmentMaintenance,
  Supply
} = require('../models');

async function seed() {
  try {
    console.log('🔗 Connecting to database...');
    // Sync to make sure models are created
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    // 1. Get first club
    const club = await Club.findOne();
    if (!club) {
      console.log('❌ No club found. Please create a club and users first.');
      process.exit();
    }
    const clubId = club.id;

    // 2. Get some users (Doctors/physiotherapists)
    const doctors = await User.findAll({ where: { club_id: clubId, role: 'doctor' } });
    const physios = await User.findAll({ where: { club_id: clubId, role: 'physiotherapist' } });
    const doctor = doctors.length ? doctors[0] : (await User.findOne({ where: { club_id: clubId } }));
    const physio = physios.length ? physios[0] : doctor;

    // 3. Get players
    const players = await Player.findAll({ where: { club_id: clubId }, limit: 5 });
    if (players.length === 0) {
      console.log('❌ No players found. Adding dummy players first.');
      // Add players
      for(let i=1; i<=3; i++) {
        players.push(await Player.create({
          club_id: clubId,
          name: `لاعب تجريبي ${i}`,
          national_id: `10000000${i}`,
          date_of_birth: '1995-05-10',
          position: 'مهاجم',
          number: 10 + i,
          status: 'ready'
        }));
      }
    }

    console.log('🧹 Clearing old vitals and rehabs...');
    await RehabSession.destroy({ where: {} });
    await Rehabilitation.destroy({ where: {} });
    await Vital.destroy({ where: {} });
    await Injury.destroy({ where: {} });
    await EquipmentMaintenance.destroy({ where: {} });
    await Equipment.destroy({ where: {} });
    await Supply.destroy({ where: {} });

    console.log('🌱 Injecting Vitals data...');
    // Add Vitals over the last 10 days for players[0] and players[1]
    const vitalsData = [];
    const now = new Date();
    for (let pIdx = 0; pIdx < 2; pIdx++) {
      const player = players[pIdx];
      for (let day = 10; day >= 0; day--) {
        const recordDate = new Date(now);
        recordDate.setDate(recordDate.getDate() - day);
        
        vitalsData.push({
          club_id: clubId,
          player_id: player.id,
          recorded_by: doctor.id,
          recorded_at: recordDate,
          heart_rate: 60 + Math.floor(Math.random() * 20),
          blood_pressure_systolic: 110 + Math.floor(Math.random() * 20),
          blood_pressure_diastolic: 70 + Math.floor(Math.random() * 15),
          temperature: parseFloat((36.5 + Math.random() * 1).toFixed(1)),
          spo2: 96 + Math.floor(Math.random() * 4),
          weight: pIdx === 0 ? parseFloat((75.5 + Math.random()).toFixed(1)) : parseFloat((82.0 + Math.random()).toFixed(1)),
          height: pIdx === 0 ? 175 : 185,
          fatigue_level: Math.floor(Math.random() * 5),
          sleep_hours: 6 + Math.floor(Math.random() * 4),
          hydration_status: ['poor', 'fair', 'good', 'optimal'][Math.floor(Math.random() * 4)],
          notes: 'قياسات طبيعية'
        });
      }
    }
    // Add one abnormal vital for player 2
    if(players.length > 2) {
       vitalsData.push({
          club_id: clubId,
          player_id: players[2].id,
          recorded_by: doctor.id,
          recorded_at: now,
          heart_rate: 115,
          blood_pressure_systolic: 145,
          blood_pressure_diastolic: 95,
          temperature: 38.5,
          spo2: 93,
          weight: 71,
          height: 172,
          fatigue_level: 8,
          sleep_hours: 4,
          hydration_status: 'poor',
          notes: 'يحتاج لراحة وتقييم طبي فوري'
       });
    }
    await Vital.bulkCreate(vitalsData);

    console.log('🌱 Injecting Rehab & Injuries data...');
    // Create an Injury for Player 0
    const injury1 = await Injury.create({
      club_id: clubId,
      player_id: players[0].id,
      injury_type: 'تمزق في العضلة الخلفية',
      body_area: 'الفخذ',
      body_side: 'right',
      severity: 'moderate',
      expected_recovery_days: 30,
      injury_date: new Date(new Date().setDate(now.getDate() - 15)).toISOString().split('T')[0],
      treating_doctor_id: doctor.id,
      mechanism: 'overuse',
      occurred_during: 'training',
      status: 'recovering'
    });

    // Create active Rehab string
    const endDate1 = new Date(now);
    endDate1.setDate(now.getDate() + 15);
    const rehab1 = await Rehabilitation.create({
      club_id: clubId,
      player_id: players[0].id,
      injury_id: injury1.id,
      program_name: 'تأهيل تمزق العضلة الخلفية - درجة 2',
      phase: 2,
      phase_label: 'بدء تمارين التقوية',
      progress_pct: 45,
      start_date: new Date(new Date().setDate(now.getDate() - 10)).toISOString().split('T')[0],
      expected_end_date: endDate1.toISOString().split('T')[0],
      therapist_id: physio.id,
      status: 'active',
      goals: '- تخفيف الألم والالتهاب\n- استعادة المدى الحركي الكامل\n- تقوية العضلة بنسبة 70%',
      exercises_description: '- تمارين تمدد خفيفة لمدة 10 دقائق\n- تمارين تقوية بالمقاومة المائية\n- ركوب دراجة ثابتة 15 دقيقة بدون مقاومة',
    });
    
    // Add sessions for rehab1
    const sessions = [];
    for(let i=9; i>=0; i--) {
      // Log session every day except today
      if(i === 0) continue;
      const sDate = new Date(now);
      sDate.setDate(now.getDate() - i);
      sessions.push({
        club_id: clubId,
        program_id: rehab1.id,
        player_id: players[0].id,
        therapist_id: physio.id,
        session_date: sDate.toISOString().split('T')[0],
        duration_minutes: 45,
        session_type: 'علاج طبيعي وتقوية',
        exercises_done: 'تمدد وكمادات باردة',
        pain_level: i > 5 ? 6 : i > 2 ? 4 : 2, // Pain decreases over time
        progress_notes: i > 5 ? 'اللاعب يشعر ببعض الألم' : 'تحسن ملحوظ في المدى الحركي',
        attendance: Math.random() > 0.1 ? 'attended' : 'missed',
      });
    }
    await RehabSession.bulkCreate(sessions);

    // Create completed Rehab string
    const rehab2 = await Rehabilitation.create({
      club_id: clubId,
      player_id: players[1].id,
      program_name: 'تأهيل الكتف الأيمن',
      phase: 4,
      phase_label: 'اكتملت جميع المراحل',
      progress_pct: 100,
      start_date: new Date(new Date().setDate(now.getDate() - 40)).toISOString().split('T')[0],
      expected_end_date: new Date(new Date().setDate(now.getDate() - 5)).toISOString().split('T')[0],
      actual_end_date: new Date(new Date().setDate(now.getDate() - 2)).toISOString().split('T')[0],
      therapist_id: physio.id,
      status: 'completed',
      goals: 'العودة التدريجية للتدريب',
    });
    
    // Update player statuses
    await players[0].update({ status: 'rehab' });
    if(players.length > 2) await players[2].update({ status: 'ready' });

    console.log('💉 Injecting Medical Equipment & Supplies...');
    // Add Equipment
    const eq1 = await Equipment.create({
      club_id: clubId,
      name: 'جهاز موجات تصادمية - Shockwave',
      brand: 'BTL',
      model: 'BTL-6000',
      serial_number: 'SW-102938',
      location: 'عيادة العلاج الطبيعي',
      status: 'good',
      purchase_date: '2022-01-15',
      purchase_price: 120000,
      next_maintenance_date: new Date(new Date().setDate(now.getDate() + 15)).toISOString().split('T')[0], // Needs maintenance soon but not urgent
      warranty_expiry: '2025-01-15',
      requires_calibration: true,
      calibration_date: '2023-01-15',
    });

    const eq2 = await Equipment.create({
      club_id: clubId,
      name: 'جهاز ليزر بارد',
      brand: 'Enraf-Nonius',
      status: 'needs_maintenance',
      location: 'غرفة الكشف',
      next_maintenance_date: new Date(new Date().setDate(now.getDate() - 5)).toISOString().split('T')[0], // Urgent, past due
    });

    // Add Supplies
    await Supply.bulkCreate([
      {
        club_id: clubId,
        name: 'شريط لاصق رياضي (Kinesio Tape)',
        category: 'consumable',
        total_quantity: 5,
        reorder_level: 20, // Low stock
        unit: 'لفة',
        storage_location: 'خزانة 2',
      },
      {
        club_id: clubId,
        name: 'مرهم مسكن للآلام (Voltaren)',
        category: 'topical',
        total_quantity: 45,
        reorder_level: 10,
        unit: 'أنبوبة',
        expiry_date: new Date(new Date().setDate(now.getDate() + 25)).toISOString().split('T')[0], // Expiring soon
      },
      {
        club_id: clubId,
        name: 'أربطة ضاغطة مرنة',
        category: 'consumable',
        total_quantity: 50,
        reorder_level: 15,
        unit: 'رباط',
      }
    ]);

    console.log('✅ Seed Data injected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error injecting data:', error);
    process.exit(1);
  }
}

seed();
