/**
 * سكريبت ضخ بيانات شاملة لصفحة الإصابات وتحديث كل الصفحات
 * تشغيل: node src/scripts/seedInjuries.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const {
  sequelize,
  Club,
  User,
  Player,
  Injury,
  Rehabilitation,
  RehabSession,
  Vital,
  Appointment,
  Performance,
} = require('../models');

const dayjs = require('dayjs');

// ───────────────────────────
// بيانات الإصابات الواقعية
// ───────────────────────────
const INJURY_TYPES = [
  'التواء - الدرجة الأولى',
  'التواء - الدرجة الثانية',
  'شد عضلي',
  'تمزق عضلي جزئي',
  'تمزق عضلي كامل',
  'كسر جزئي',
  'التهاب وتر أكيليس',
  'التهاب الوتر الرضفي',
  'إصابة الرباط الصليبي الأمامي',
  'ورم غضروفي',
  'كدمة شديدة',
  'إجهاد الظهر',
  'تهيج مفصلي',
  'شد في الفخذ',
];

const BODY_AREAS = [
  'الركبة', 'الكاحل', 'الفخذ', 'الساق', 'الورك',
  'الكتف', 'الظهر', 'الرسغ', 'الوتر الرضفي', 'وتر أكيليس',
  'القدم', 'الرقبة', 'البطن',
];

const MECHANISMS = ['collision', 'overuse', 'fatigue', 'unknown'];
const OCCURRED_DURING = ['match', 'training', 'other'];
const SEVERITIES = ['mild', 'moderate', 'severe', 'critical'];
const BODY_SIDES = ['right', 'left', 'both'];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function daysAgo(n) { return dayjs().subtract(n, 'day').format('YYYY-MM-DD'); }

async function seedInjuries() {
  console.log('🔗 Connecting to database...');
  await sequelize.authenticate();
  console.log('✅ Connected.\n');

  // ── المتطلبات الأساسية ─────────────────────────
  const club = await Club.findOne();
  if (!club) { console.error('❌ No club found. Run the auth setup first.'); process.exit(1); }
  const clubId = club.id;

  const allUsers = await User.findAll({ where: { club_id: clubId } });
  const doctors  = allUsers.filter(u => u.role === 'doctor' || u.role === 'physiotherapist');
  const doctorId = doctors.length ? doctors[0].id : allUsers[0]?.id;
  const physioId = doctors.length > 1 ? doctors[1].id : doctors[0]?.id || allUsers[0]?.id;
  const creatorId = allUsers[0]?.id;

  if (!creatorId) { console.error('❌ No users found.'); process.exit(1); }

  const players = await Player.findAll({ where: { club_id: clubId, is_active: true } });
  if (players.length === 0) { console.error('❌ No active players found.'); process.exit(1); }

  console.log(`👥 Found ${players.length} players\n`);

  // ── مسح بيانات الإصابات القديمة ───────────────
  console.log('🧹 Clearing old injury data...');
  await RehabSession.destroy({ where: { club_id: clubId } });
  await Rehabilitation.destroy({ where: { club_id: clubId } });
  await Injury.destroy({ where: { club_id: clubId } });
  console.log('✅ Old data cleared.\n');

  // ── إنشاء الإصابات ──────────────────────────────
  console.log('🩺 Creating injuries...\n');

  const injuriesCreated = [];

  // ─ إصابات مغلقة (سجل تاريخي) - آخر 3 أشهر ─────
  const closedScenarios = [
    { type: 'التواء - الدرجة الأولى',  area: 'الكاحل',         side: 'right', sev: 'mild',     age: 80, recDays: 10, actDays: 8  },
    { type: 'شد عضلي',                  area: 'الفخذ',          side: 'left',  sev: 'mild',     age: 70, recDays: 7,  actDays: 7  },
    { type: 'كدمة شديدة',               area: 'الساق',          side: 'right', sev: 'mild',     age: 60, recDays: 5,  actDays: 4  },
    { type: 'التواء - الدرجة الثانية', area: 'الركبة',          side: 'left',  sev: 'moderate', age: 55, recDays: 21, actDays: 18 },
    { type: 'التهاب وتر أكيليس',       area: 'وتر أكيليس',     side: 'right', sev: 'moderate', age: 50, recDays: 28, actDays: 25 },
    { type: 'تمزق عضلي جزئي',           area: 'الفخذ',          side: 'right', sev: 'severe',   age: 45, recDays: 45, actDays: 42 },
    { type: 'إجهاد الظهر',              area: 'الظهر',          side: 'both',  sev: 'moderate', age: 40, recDays: 14, actDays: 12 },
    { type: 'كسر جزئي',                 area: 'القدم',          side: 'left',  sev: 'severe',   age: 90, recDays: 60, actDays: 55 },
  ];

  for (let i = 0; i < closedScenarios.length; i++) {
    const sc = closedScenarios[i];
    const player = players[i % players.length];
    const injDate = daysAgo(sc.age);
    const retDate = daysAgo(sc.age - sc.actDays);

    const inj = await Injury.create({
      club_id: clubId,
      player_id: player.id,
      injury_type: sc.type,
      body_area: sc.area,
      body_side: sc.side,
      severity: sc.sev,
      expected_recovery_days: sc.recDays,
      actual_recovery_days: sc.actDays,
      injury_date: injDate,
      return_date: retDate,
      treating_doctor_id: doctorId,
      mechanism: randFrom(MECHANISMS),
      occurred_during: randFrom(OCCURRED_DURING),
      is_recurring: Math.random() < 0.2,
      recurrence_count: Math.random() < 0.2 ? randInt(1, 3) : 0,
      status: 'closed',
      description: `إصابة ${sc.type} تمت معالجتها بنجاح`,
      treatment_plan: `1. راحة تامة\n2. علاج طبيعي\n3. تمارين تأهيلية تدريجية`,
      created_by: creatorId,
    });
    injuriesCreated.push(inj);
    console.log(`  ✅ [مغلقة] ${sc.type} - ${player.name}`);
  }

  // ─ إصابات في مرحلة التعافي ─────────────────────
  const recoveringScenarios = [
    { type: 'التواء - الدرجة الثانية', area: 'الكاحل',           side: 'left',  sev: 'moderate', age: 20, recDays: 30 },
    { type: 'التهاب الوتر الرضفي',     area: 'الوتر الرضفي',     side: 'right', sev: 'moderate', age: 18, recDays: 25 },
    { type: 'شد في الفخذ',              area: 'الفخذ',            side: 'right', sev: 'mild',     age: 10, recDays: 14 },
  ];

  for (let i = 0; i < recoveringScenarios.length; i++) {
    const sc = recoveringScenarios[i];
    const playerIdx = (closedScenarios.length + i) % players.length;
    const player = players[playerIdx];

    const inj = await Injury.create({
      club_id: clubId,
      player_id: player.id,
      injury_type: sc.type,
      body_area: sc.area,
      body_side: sc.side,
      severity: sc.sev,
      expected_recovery_days: sc.recDays,
      injury_date: daysAgo(sc.age),
      treating_doctor_id: doctorId,
      mechanism: randFrom(MECHANISMS),
      occurred_during: randFrom(OCCURRED_DURING),
      is_recurring: false,
      recurrence_count: 0,
      status: 'recovering',
      description: `اللاعب في مرحلة التعافي من ${sc.type}`,
      treatment_plan: `1. تمارين تمدد\n2. علاج بالموجات فوق الصوتية\n3. تقوية العضلات المحيطة`,
      created_by: creatorId,
    });
    injuriesCreated.push(inj);

    // برنامج تأهيل لكل إصابة في التعافي
    const rehabProgress = Math.round((sc.age / sc.recDays) * 100);
    const rehab = await Rehabilitation.create({
      club_id: clubId,
      player_id: player.id,
      injury_id: inj.id,
      program_name: `تأهيل ${sc.type} - ${player.name}`,
      phase: Math.min(4, Math.ceil(sc.age / (sc.recDays / 4))),
      phase_label: sc.age < sc.recDays * 0.25 ? 'مرحلة الراحة'
        : sc.age < sc.recDays * 0.5 ? 'مرحلة العلاج الطبيعي'
        : sc.age < sc.recDays * 0.75 ? 'مرحلة التقوية'
        : 'مرحلة العودة للتدريب',
      progress_pct: Math.min(95, rehabProgress),
      start_date: daysAgo(sc.age - 2),
      expected_end_date: daysAgo(-(sc.recDays - sc.age)),
      therapist_id: physioId,
      status: 'active',
      goals: `- تخفيف الألم والالتهاب\n- استعادة المدى الحركي الكامل\n- تقوية العضلات المحيطة\n- العودة التدريجية للتدريب`,
    });

    // جلسات التأهيل
    const sessionDays = Math.min(sc.age, 10);
    const sessionsData = [];
    for (let d = sessionDays; d >= 1; d--) {
      sessionsData.push({
        club_id: clubId,
        program_id: rehab.id,
        player_id: player.id,
        therapist_id: physioId,
        session_date: daysAgo(d),
        duration_minutes: 45,
        session_type: 'علاج طبيعي وتقوية',
        exercises_done: 'تمدد، ضغط بارد، تقوية بمقاومة خفيفة',
        pain_level: Math.max(1, Math.round(7 - (sessionDays - d) * 0.6)),
        progress_notes: d > sessionDays * 0.5 ? 'مستجد، يشعر ببعض الألم' : 'تحسن ملحوظ',
        attendance: 'attended',
      });
    }
    await RehabSession.bulkCreate(sessionsData);

    // تحديث حالة اللاعب
    await player.update({ status: 'rehab' });
    console.log(`  ✅ [تعافي] ${sc.type} - ${player.name} + برنامج تأهيل`);
  }

  // ─ إصابات نشطة ─────────────────────────────────
  const activeScenarios = [
    { type: 'إصابة الرباط الصليبي الأمامي', area: 'الركبة',     side: 'right', sev: 'critical', age: 5,  recDays: 180, desc: 'إصابة خطيرة تحتاج تدخلاً جراحياً' },
    { type: 'تمزق عضلي كامل',                area: 'الفخذ',     side: 'left',  sev: 'severe',   age: 3,  recDays: 60,  desc: 'تمزق في العضلة ذات الرأسين الفخذية' },
    { type: 'كسر جزئي',                       area: 'الكاحل',   side: 'right', sev: 'severe',   age: 7,  recDays: 45,  desc: 'كسر في الكعب الخارجي' },
    { type: 'التهاب حاد في الكتف',            area: 'الكتف',    side: 'right', sev: 'moderate', age: 2,  recDays: 21,  desc: 'التهاب في الأكياس المفصلية' },
    { type: 'إصابة الغضروف',                  area: 'الركبة',   side: 'left',  sev: 'severe',   age: 4,  recDays: 90,  desc: 'تلف في الغضروف الهلالي' },
  ];

  for (let i = 0; i < activeScenarios.length; i++) {
    const sc = activeScenarios[i];
    const playerIdx = (closedScenarios.length + recoveringScenarios.length + i) % players.length;
    const player = players[playerIdx];

    const inj = await Injury.create({
      club_id: clubId,
      player_id: player.id,
      injury_type: sc.type,
      body_area: sc.area,
      body_side: sc.side,
      severity: sc.sev,
      expected_recovery_days: sc.recDays,
      injury_date: daysAgo(sc.age),
      treating_doctor_id: doctorId,
      mechanism: randFrom(MECHANISMS),
      occurred_during: i < 2 ? 'match' : 'training',
      is_recurring: i === 4,
      recurrence_count: i === 4 ? 2 : 0,
      status: 'active',
      description: sc.desc,
      treatment_plan: `1. راحة تامة من التدريب\n2. أدوية مضادة للالتهاب\n3. جليد 3 مرات يومياً\n4. إعادة تقييم بعد أسبوع`,
      created_by: creatorId,
    });
    injuriesCreated.push(inj);

    // تحديث حالة اللاعب
    await player.update({ status: 'injured' });
    console.log(`  ✅ [نشطة] ${sc.type} - ${player.name}`);
  }

  // ── إضافة مؤشرات حيوية للأسابيع الأربعة الماضية ──
  console.log('\n💓 Creating vitals for last 30 days...');
  const vitalsData = [];
  const measurementPlayers = players.slice(0, Math.min(8, players.length));

  for (const player of measurementPlayers) {
    for (let day = 30; day >= 0; day -= 2) {
      const baseHR = 65 + Math.floor(Math.random() * 15);
      vitalsData.push({
        club_id: clubId,
        player_id: player.id,
        recorded_by: doctorId,
        recorded_at: dayjs().subtract(day, 'day').toDate(),
        heart_rate: baseHR,
        blood_pressure_systolic: 110 + Math.floor(Math.random() * 20),
        blood_pressure_diastolic: 70  + Math.floor(Math.random() * 15),
        temperature: parseFloat((36.5 + Math.random() * 0.8).toFixed(1)),
        spo2: 96 + Math.floor(Math.random() * 4),
        weight: 72 + Math.floor(Math.random() * 20),
        height: 170 + Math.floor(Math.random() * 20),
        fatigue_level: Math.floor(Math.random() * 6),
        sleep_hours: 6 + Math.floor(Math.random() * 4),
        hydration_level: randFrom(['good', 'optimal', 'fair']),
        general_notes: 'قياسات دورية',
      });
    }
  }
  await Vital.bulkCreate(vitalsData);
  console.log(`  ✅ ${vitalsData.length} vital records created`);

  // ── إضافة تقييمات أداء ──────────────────────────
  console.log('\n🏃 Creating performance records...');
  const perfPlayers = players.slice(0, Math.min(10, players.length));
  const perfData = [];
  for (const player of perfPlayers) {
    for (let week = 4; week >= 0; week--) {
      perfData.push({
        club_id: clubId,
        player_id: player.id,
        evaluator_id: doctorId,
        evaluation_date: daysAgo(week * 7),
        strength_pct:    60 + Math.floor(Math.random() * 35),
        endurance_pct:   55 + Math.floor(Math.random() * 40),
        flexibility_pct: 50 + Math.floor(Math.random() * 45),
        agility_score:   60 + Math.floor(Math.random() * 38),
        reaction_time_ms: 180 + Math.floor(Math.random() * 120),
        overall_score_pct: 65 + Math.floor(Math.random() * 30),
        notes: 'تقييم أسبوعي روتيني',
      });
    }
  }
  await Performance.bulkCreate(perfData);
  console.log(`  ✅ ${perfData.length} performance records created`);

  // ── إضافة مواعيد اليوم ──────────────────────────
  console.log('\n📅 Creating today appointments...');
  const today = dayjs().format('YYYY-MM-DD');
  const appointmentData = [];
  const times = ['09:00', '10:30', '11:30', '14:00', '15:30'];
  const apptTypes = ['فحص دوري', 'متابعة إصابة', 'جلسة تأهيل', 'تقييم طبي', 'فحص لياقة'];

  for (let i = 0; i < Math.min(5, players.length); i++) {
    appointmentData.push({
      club_id: clubId,
      player_id: players[i].id,
      doctor_id: doctorId,
      appointment_type: apptTypes[i],
      scheduled_date: today,
      scheduled_time: times[i] + ':00',
      duration_minutes: 30,
      status: 'scheduled',
      location: 'غرفة العيادة الطبية',
      notes: `موعد ${apptTypes[i]} للاعب ${players[i].name}`,
    });
  }
  await Appointment.bulkCreate(appointmentData);
  console.log(`  ✅ ${appointmentData.length} appointments created for today`);

  // ── ملخص نهائي ──────────────────────────────────
  const injStats = {
    active:     activeScenarios.length,
    recovering: recoveringScenarios.length,
    closed:     closedScenarios.length,
    total:      injuriesCreated.length,
  };

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Seed completed successfully!\n');
  console.log('📊 Injuries Summary:');
  console.log(`   🔴 Active:     ${injStats.active}`);
  console.log(`   🟡 Recovering: ${injStats.recovering}`);
  console.log(`   🟢 Closed:     ${injStats.closed}`);
  console.log(`   📈 Total:      ${injStats.total}`);
  console.log(`\n💓 Vitals:       ${vitalsData.length} records`);
  console.log(`🏃 Performance:  ${perfData.length} records`);
  console.log(`📅 Appointments: ${appointmentData.length} (today)`);
  console.log('═'.repeat(50));

  process.exit(0);
}

seedInjuries().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
