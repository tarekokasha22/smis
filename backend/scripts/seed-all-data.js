'use strict';

/**
 * Comprehensive seed script for SMIS
 * Uses correct IDs from actual DB:
 * - club_id: 1
 * - user IDs: 32 (admin), 33 (doctor), 34 (nutritionist)
 * - player IDs: 29-52
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const seq = new Sequelize(
  process.env.DB_NAME || 'smis_db',
  process.env.DB_USER || 'smis_user',
  process.env.DB_PASSWORD || 'smis_pass_2024',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

async function seedAll() {
  try {
    await seq.authenticate();
    console.log('✅ Connected to DB');

    // ====================================
    // 1. INJURIES (10 realistic entries)
    // ====================================
    console.log('\n📌 Seeding injuries...');
    await seq.query('DELETE FROM injuries WHERE club_id = 1');

    const injuries = [
      {
        club_id: 1, player_id: 49, injury_type: 'تمزق في الرباط الصليبي الأمامي',
        body_area: 'الركبة', body_side: 'right', severity: 'severe',
        expected_recovery_days: 180, actual_recovery_days: null,
        injury_date: '2025-01-15', return_date: null,
        treating_doctor_id: 33, mechanism: 'collision', occurred_during: 'match',
        is_recurring: false, recurrence_count: 0,
        description: 'تمزق كامل في الرباط الصليبي الأمامي للركبة اليمنى أثناء مباراة الدوري. اللاعب صالح الشهري تعرض للإصابة بعد تصادم مع مدافع الخصم.',
        treatment_plan: 'جراحة منظار + برنامج تأهيل طبيعي مكثف لمدة 6 أشهر + علاج بالموجات فوق الصوتية',
        status: 'active', created_by: 33,
        created_at: new Date('2025-01-15'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: 34, injury_type: 'إجهاد عضلي في العضلة الخلفية',
        body_area: 'الفخذ', body_side: 'left', severity: 'moderate',
        expected_recovery_days: 28, actual_recovery_days: null,
        injury_date: '2025-02-20', return_date: null,
        treating_doctor_id: 33, mechanism: 'overuse', occurred_during: 'training',
        is_recurring: true, recurrence_count: 2,
        description: 'إجهاد عضلي من الدرجة الثانية في العضلة الخلفية للفخذ الأيسر - إصابة متكررة للاعب علي البليهي',
        treatment_plan: 'راحة تامة أسبوعين + علاج طبيعي + تمارين تأهيلية تدريجية',
        status: 'recovering', created_by: 33,
        created_at: new Date('2025-02-20'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: 36, injury_type: 'كسر في عظمة الشظية',
        body_area: 'الساق', body_side: 'right', severity: 'severe',
        expected_recovery_days: 90, actual_recovery_days: 88,
        injury_date: '2024-11-05', return_date: '2025-02-01',
        treating_doctor_id: 33, mechanism: 'collision', occurred_during: 'match',
        is_recurring: false, recurrence_count: 0,
        description: 'كسر في الثلث السفلي من عظمة الشظية اليمنى للاعب متعب المفرج',
        treatment_plan: 'تجبيس + راحة تامة + علاج طبيعي بعد رفع الجبس',
        status: 'closed', created_by: 33,
        created_at: new Date('2024-11-05'), updated_at: new Date('2025-02-01'),
      },
      {
        club_id: 1, player_id: 41, injury_type: 'التواء في الكاحل',
        body_area: 'الكاحل', body_side: 'left', severity: 'mild',
        expected_recovery_days: 14, actual_recovery_days: null,
        injury_date: '2025-03-10', return_date: null,
        treating_doctor_id: 33, mechanism: 'collision', occurred_during: 'match',
        is_recurring: false, recurrence_count: 0,
        description: 'التواء بسيط في الكاحل الأيسر أثناء المباراة للاعب سالم الدوسري',
        treatment_plan: 'تبريد + رفع القدم + ضمادات + علاج طبيعي',
        status: 'active', created_by: 33,
        created_at: new Date('2025-03-10'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: 38, injury_type: 'خلع في الكتف',
        body_area: 'الكتف', body_side: 'right', severity: 'moderate',
        expected_recovery_days: 45, actual_recovery_days: 42,
        injury_date: '2025-01-28', return_date: '2025-03-11',
        treating_doctor_id: 33, mechanism: 'collision', occurred_during: 'match',
        is_recurring: false, recurrence_count: 0,
        description: 'خلع جزئي في مفصل الكتف الأيمن للاعب سلمان الفرج',
        treatment_plan: 'إعادة الوضع + تثبيت + علاج طبيعي تدريجي',
        status: 'closed', created_by: 33,
        created_at: new Date('2025-01-28'), updated_at: new Date('2025-03-11'),
      },
      {
        club_id: 1, player_id: 30, injury_type: 'ارتجاج في المخ',
        body_area: 'الرأس', body_side: null, severity: 'severe',
        expected_recovery_days: 21, actual_recovery_days: null,
        injury_date: '2025-04-01', return_date: null,
        treating_doctor_id: 33, mechanism: 'collision', occurred_during: 'match',
        is_recurring: false, recurrence_count: 0,
        description: 'ارتجاج في المخ درجة أولى للاعب عبدالله الجدعاني بعد اصطدام قوي بالرأس',
        treatment_plan: 'راحة تامة + بروتوكول العودة التدريجية لكرة القدم + متابعة طبية أسبوعية',
        status: 'active', created_by: 33,
        created_at: new Date('2025-04-01'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: 40, injury_type: 'التهاب في وتر أخيل',
        body_area: 'الكاحل', body_side: 'right', severity: 'moderate',
        expected_recovery_days: 42, actual_recovery_days: null,
        injury_date: '2025-02-14', return_date: null,
        treating_doctor_id: 33, mechanism: 'overuse', occurred_during: 'training',
        is_recurring: true, recurrence_count: 1,
        description: 'التهاب مزمن في وتر أخيل الأيمن للاعب عبدالإله المالكي - إصابة متكررة',
        treatment_plan: 'راحة + علاج بالموجات فوق الصوتية + تمارين إطالة + تعديل برنامج التدريب',
        status: 'recovering', created_by: 33,
        created_at: new Date('2025-02-14'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: 47, injury_type: 'شد عضلي في أسفل الظهر',
        body_area: 'الظهر', body_side: null, severity: 'mild',
        expected_recovery_days: 10, actual_recovery_days: 8,
        injury_date: '2025-03-22', return_date: '2025-03-30',
        treating_doctor_id: 33, mechanism: 'fatigue', occurred_during: 'training',
        is_recurring: false, recurrence_count: 0,
        description: 'شد عضلي خفيف في عضلات أسفل الظهر للاعب عبدالرحمن غريب',
        treatment_plan: 'راحة + علاج حراري + تدليك + تمارين إطالة',
        status: 'closed', created_by: 33,
        created_at: new Date('2025-03-22'), updated_at: new Date('2025-03-30'),
      },
      {
        club_id: 1, player_id: 50, injury_type: 'كدمة عظمية',
        body_area: 'القدم', body_side: 'left', severity: 'mild',
        expected_recovery_days: 14, actual_recovery_days: null,
        injury_date: '2025-04-05', return_date: null,
        treating_doctor_id: 33, mechanism: 'collision', occurred_during: 'match',
        is_recurring: false, recurrence_count: 0,
        description: 'كدمة عظمية في عظام مشط القدم اليسرى للاعب محمد الربيعي',
        treatment_plan: 'تبريد + راحة + أحذية واقية خاصة + مراقبة إشعاعية',
        status: 'active', created_by: 33,
        created_at: new Date('2025-04-05'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: 35, injury_type: 'تمزق في الغضروف الهلالي',
        body_area: 'الركبة', body_side: 'left', severity: 'severe',
        expected_recovery_days: 150, actual_recovery_days: null,
        injury_date: '2025-01-08', return_date: null,
        treating_doctor_id: 33, mechanism: 'collision', occurred_during: 'training',
        is_recurring: false, recurrence_count: 0,
        description: 'تمزق في الغضروف الهلالي الداخلي للركبة اليسرى للاعب كالدون كوليبالي',
        treatment_plan: 'جراحة منظار لإصلاح/إزالة الغضروف التالف + تأهيل طبيعي 5 أشهر',
        status: 'recovering', created_by: 33,
        created_at: new Date('2025-01-08'), updated_at: new Date(),
      },
    ];

    for (const inj of injuries) {
      await seq.query(
        `INSERT INTO injuries (club_id, player_id, injury_type, body_area, body_side, severity, expected_recovery_days, actual_recovery_days, injury_date, return_date, treating_doctor_id, mechanism, occurred_during, is_recurring, recurrence_count, description, treatment_plan, status, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        { replacements: [inj.club_id, inj.player_id, inj.injury_type, inj.body_area, inj.body_side, inj.severity, inj.expected_recovery_days, inj.actual_recovery_days, inj.injury_date, inj.return_date, inj.treating_doctor_id, inj.mechanism, inj.occurred_during, inj.is_recurring ? 1 : 0, inj.recurrence_count, inj.description, inj.treatment_plan, inj.status, inj.created_by, inj.created_at, inj.updated_at] }
      );
    }
    const [[injResult]] = await seq.query('SELECT COUNT(*) as cnt FROM injuries WHERE club_id = 1');
    console.log(`✅ Injuries: ${injResult.cnt} records`);

    // Get injury IDs for rehab
    const [injuryRows] = await seq.query('SELECT id, player_id FROM injuries WHERE club_id = 1 ORDER BY id');

    // ====================================
    // 2. REHABILITATION PROGRAMS (8 entries)
    // ====================================
    console.log('\n📌 Seeding rehabilitation programs...');
    await seq.query('DELETE FROM rehab_sessions WHERE club_id = 1');
    await seq.query('DELETE FROM rehabilitation_programs WHERE club_id = 1');

    const rehabPrograms = [
      {
        club_id: 1, player_id: injuryRows[0].player_id, injury_id: injuryRows[0].id,
        program_name: 'برنامج تأهيل الرباط الصليبي - المرحلة الأولى',
        phase: 1, phase_label: 'مرحلة أولية',
        progress_pct: 35, start_date: '2025-02-01', expected_end_date: '2025-07-15',
        actual_end_date: null, therapist_id: 33, status: 'active',
        goals: 'تقليل التورم والألم - استعادة مدى الحركة - تقوية العضلات المحيطة بالركبة',
        exercises_description: 'تمارين حركة الكاحل - رفع الساق المستقيمة - ضغط المنظفة الرضفة - تمارين الكواد',
        notes: 'اللاعب يتقدم بشكل جيد. لا يزال يعاني من بعض الألم عند الثني الكامل.',
        created_at: new Date('2025-02-01'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: injuryRows[1].player_id, injury_id: injuryRows[1].id,
        program_name: 'تأهيل إجهاد عضلات الفخذ',
        phase: 2, phase_label: 'مرحلة متوسطة',
        progress_pct: 60, start_date: '2025-02-25', expected_end_date: '2025-03-25',
        actual_end_date: null, therapist_id: 33, status: 'active',
        goals: 'استعادة القوة العضلية الكاملة - العودة للجري',
        exercises_description: 'جري خفيف - تمارين الهامسترينج - تمارين التمدد المتدرج - تمارين الديناميكا',
        notes: 'اللاعب متحمس ويتقدم جيداً. تحذير من الإفراط في التدريب.',
        created_at: new Date('2025-02-25'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: injuryRows[6].player_id, injury_id: injuryRows[6].id,
        program_name: 'تأهيل التهاب وتر أخيل',
        phase: 2, phase_label: 'مرحلة متوسطة',
        progress_pct: 50, start_date: '2025-03-01', expected_end_date: '2025-03-28',
        actual_end_date: null, therapist_id: 33, status: 'active',
        goals: 'علاج الالتهاب - تقوية وتر أخيل - العودة للجري',
        exercises_description: 'تمارين رفع الكعب - إطالة الكعب - تمارين التوازن - موجات فوق الصوتية علاجية',
        notes: 'التقدم جيد. استمرار في العلاج بالموجات فوق الصوتية 3 مرات أسبوعياً.',
        created_at: new Date('2025-03-01'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: injuryRows[9].player_id, injury_id: injuryRows[9].id,
        program_name: 'تأهيل الغضروف الهلالي - برنامج متكامل',
        phase: 1, phase_label: 'مرحلة أولية',
        progress_pct: 20, start_date: '2025-02-15', expected_end_date: '2025-07-01',
        actual_end_date: null, therapist_id: 33, status: 'active',
        goals: 'التعافي من الجراحة - استعادة مدى الحركة الكامل',
        exercises_description: 'تمارين التحريك السلبي - تمارين التقوية المبكرة - حمام المياه الدافئة',
        notes: 'بعد 2 أسبوع من الجراحة. التقدم مرضٍ.',
        created_at: new Date('2025-02-15'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: injuryRows[2].player_id, injury_id: injuryRows[2].id,
        program_name: 'تأهيل كسر الشظية - العودة للملاعب',
        phase: 4, phase_label: 'مرحلة العودة للملاعب',
        progress_pct: 95, start_date: '2025-01-10', expected_end_date: '2025-02-10',
        actual_end_date: '2025-02-01', therapist_id: 33, status: 'completed',
        goals: 'العودة الكاملة للتدريب والمباريات',
        exercises_description: 'جري كامل - تدريبات الكرة الكاملة - مباريات تجريبية',
        notes: 'تأهيل ناجح. اللاعب عاد للتدريبات الكاملة.',
        created_at: new Date('2025-01-10'), updated_at: new Date('2025-02-01'),
      },
      {
        club_id: 1, player_id: injuryRows[4].player_id, injury_id: injuryRows[4].id,
        program_name: 'تأهيل خلع الكتف',
        phase: 3, phase_label: 'مرحلة متقدمة',
        progress_pct: 80, start_date: '2025-02-05', expected_end_date: '2025-03-15',
        actual_end_date: '2025-03-11', therapist_id: 33, status: 'completed',
        goals: 'استعادة قوة واستقرار مفصل الكتف',
        exercises_description: 'تمارين المقاومة التدريجية للكتف - تمارين الاستقرار الكتفي - حركات الرمي',
        notes: 'تأهيل ناجح. اللاعب استأنف المشاركة الكاملة.',
        created_at: new Date('2025-02-05'), updated_at: new Date('2025-03-11'),
      },
      {
        club_id: 1, player_id: injuryRows[3].player_id, injury_id: injuryRows[3].id,
        program_name: 'تأهيل التواء الكاحل',
        phase: 2, phase_label: 'مرحلة متوسطة',
        progress_pct: 45, start_date: '2025-03-12', expected_end_date: '2025-03-24',
        actual_end_date: null, therapist_id: 33, status: 'active',
        goals: 'استعادة استقرار الكاحل وقدرته على تحمل الوزن',
        exercises_description: 'تمارين التوازن - تمارين التقوية على الكاحل - الجري الخفيف',
        notes: 'تقدم جيد. يمكن البدء بتمارين الجري خلال 3 أيام.',
        created_at: new Date('2025-03-12'), updated_at: new Date(),
      },
      {
        club_id: 1, player_id: injuryRows[8].player_id, injury_id: injuryRows[8].id,
        program_name: 'تأهيل الكدمة العظمية',
        phase: 1, phase_label: 'مرحلة أولية',
        progress_pct: 25, start_date: '2025-04-06', expected_end_date: '2025-04-20',
        actual_end_date: null, therapist_id: 33, status: 'active',
        goals: 'تقليل الألم والتورم - العودة للمشي الطبيعي',
        exercises_description: 'راحة - رفع القدم - تمارين حركة خفيفة',
        notes: 'إصابة حديثة. اللاعب في مرحلة الراحة الأولى.',
        created_at: new Date('2025-04-06'), updated_at: new Date(),
      },
    ];

    const rehabIds = [];
    for (const prog of rehabPrograms) {
      const [result] = await seq.query(
        `INSERT INTO rehabilitation_programs (club_id, player_id, injury_id, program_name, phase, phase_label, progress_pct, start_date, expected_end_date, actual_end_date, therapist_id, status, goals, exercises_description, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        { replacements: [prog.club_id, prog.player_id, prog.injury_id, prog.program_name, prog.phase, prog.phase_label, prog.progress_pct, prog.start_date, prog.expected_end_date, prog.actual_end_date, prog.therapist_id, prog.status, prog.goals, prog.exercises_description, prog.notes, prog.created_at, prog.updated_at] }
      );
      rehabIds.push(result);
    }
    const [[rehabResult]] = await seq.query('SELECT COUNT(*) as cnt FROM rehabilitation_programs WHERE club_id = 1');
    console.log(`✅ Rehabilitation programs: ${rehabResult.cnt} records`);

    // ====================================
    // 3. EQUIPMENT (10 entries)
    // ====================================
    console.log('\n📌 Seeding equipment...');
    await seq.query('DELETE FROM equipment_maintenance WHERE club_id = 1');
    await seq.query('DELETE FROM equipment WHERE club_id = 1');

    const equipment = [
      {
        club_id: 1, name: 'جهاز الموجات فوق الصوتية العلاجي', purpose: 'العلاج بالموجات فوق الصوتية لإصابات العضلات والأوتار',
        brand: 'Chattanooga', serial_number: 'US-2023-001', model: 'Intelect Mobile 2',
        location: 'غرفة العلاج الطبيعي - مقصورة 1', status: 'excellent',
        purchase_date: '2023-06-15', purchase_price: 12000.00, warranty_expiry: '2026-06-15',
        last_maintenance_date: '2025-01-15', next_maintenance_date: '2025-07-15',
        requires_calibration: true, calibration_date: '2025-01-15', usage_count: 245,
        notes: 'جهاز فعال جداً - يستخدم يومياً في جلسات العلاج الطبيعي',
        created_at: new Date('2023-06-15'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'جهاز التحفيز الكهربائي للعضلات (EMS)', purpose: 'تحفيز وتقوية العضلات وتخفيف الآلام',
        brand: 'Compex', serial_number: 'EMS-2024-001', model: 'Compex SP 8.0',
        location: 'غرفة العلاج الطبيعي - مقصورة 2', status: 'excellent',
        purchase_date: '2024-01-20', purchase_price: 8500.00, warranty_expiry: '2027-01-20',
        last_maintenance_date: '2025-02-10', next_maintenance_date: '2025-08-10',
        requires_calibration: false, calibration_date: null, usage_count: 180,
        notes: 'يستخدم في جلسات التأهيل لتقوية عضلات الفخذ والساق',
        created_at: new Date('2024-01-20'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'جهاز الليزر البارد للعلاج الطبيعي', purpose: 'علاج الالتهابات والآلام المزمنة بالليزر',
        brand: 'Erchonia', serial_number: 'LZR-2024-001', model: 'FX 405',
        location: 'غرفة العلاج الطبيعي - مقصورة 1', status: 'excellent',
        purchase_date: '2024-03-10', purchase_price: 25000.00, warranty_expiry: '2027-03-10',
        last_maintenance_date: '2025-03-10', next_maintenance_date: '2025-09-10',
        requires_calibration: true, calibration_date: '2025-03-10', usage_count: 95,
        notes: 'فعال جداً في علاج التهاب وتر أخيل والتهابات المفاصل',
        created_at: new Date('2024-03-10'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'طاولة علاج طبيعي كهربائية', purpose: 'جلسات العلاج الطبيعي والتأهيل',
        brand: 'Oakworks', serial_number: 'TBL-2023-001', model: 'Clinician Three-Section',
        location: 'غرفة العلاج الطبيعي - مقصورة 1', status: 'excellent',
        purchase_date: '2023-09-01', purchase_price: 7000.00, warranty_expiry: '2026-09-01',
        last_maintenance_date: '2025-01-05', next_maintenance_date: '2025-07-05',
        requires_calibration: false, calibration_date: null, usage_count: 520,
        notes: 'طاولة قابلة للتعديل الكهربائي لراحة المرضى أثناء الجلسات',
        created_at: new Date('2023-09-01'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'جهاز الضغط الهوائي للتعافي', purpose: 'تسريع التعافي بالضغط الهوائي على الأطراف',
        brand: 'NormaTec', serial_number: 'NRM-2024-001', model: 'NormaTec 3.0',
        location: 'غرفة الاستشفاء', status: 'excellent',
        purchase_date: '2024-07-05', purchase_price: 9500.00, warranty_expiry: '2027-07-05',
        last_maintenance_date: '2025-02-20', next_maintenance_date: '2025-08-20',
        requires_calibration: false, calibration_date: null, usage_count: 120,
        notes: 'يستخدم بانتظام بعد التدريبات المكثفة والمباريات',
        created_at: new Date('2024-07-05'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'جهاز كرايوثيرابي (العلاج بالتبريد)', purpose: 'علاج الإصابات الحادة بالتبريد',
        brand: 'Game Ready', serial_number: 'CRY-2023-001', model: 'GRPro 2.1',
        location: 'غرفة الإسعاف', status: 'needs_maintenance',
        purchase_date: '2023-12-20', purchase_price: 6000.00, warranty_expiry: '2026-12-20',
        last_maintenance_date: '2024-12-20', next_maintenance_date: '2025-04-20',
        requires_calibration: false, calibration_date: null, usage_count: 310,
        notes: 'الخرطوم الرئيسي يحتاج تبديل - صيانة مجدولة هذا الشهر',
        created_at: new Date('2023-12-20'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'دراجة تأهيل ثابتة', purpose: 'تمارين القلب والأوعية الدموية خلال التأهيل',
        brand: 'Technogym', serial_number: 'BCK-2024-001', model: 'Excite Bike Personal',
        location: 'صالة التأهيل', status: 'excellent',
        purchase_date: '2024-02-28', purchase_price: 5500.00, warranty_expiry: '2027-02-28',
        last_maintenance_date: '2025-02-28', next_maintenance_date: '2025-08-28',
        requires_calibration: false, calibration_date: null, usage_count: 380,
        notes: 'تستخدم يومياً في برامج التأهيل المبكرة',
        created_at: new Date('2024-02-28'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'جهاز قياس القوة العضلية (Dynamometer)', purpose: 'قياس قوة العضلات وتقييم مستوى التعافي',
        brand: 'BIODEX', serial_number: 'DYN-2024-001', model: 'System 4 Pro',
        location: 'صالة التقييم الوظيفي', status: 'excellent',
        purchase_date: '2024-05-15', purchase_price: 35000.00, warranty_expiry: '2027-05-15',
        last_maintenance_date: '2025-01-20', next_maintenance_date: '2025-07-20',
        requires_calibration: true, calibration_date: '2025-01-20', usage_count: 75,
        notes: 'جهاز دقيق جداً - يستخدم في تقييم اللاعبين قبل العودة للملاعب',
        created_at: new Date('2024-05-15'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'حوض علاج مائي (Hydrotherapy)', purpose: 'العلاج المائي وتأهيل الإصابات',
        brand: 'Whitehall', serial_number: 'HYD-2023-001', model: 'Whirlpool W-100',
        location: 'قسم العلاج المائي', status: 'excellent',
        purchase_date: '2023-04-10', purchase_price: 18000.00, warranty_expiry: '2026-04-10',
        last_maintenance_date: '2025-04-01', next_maintenance_date: '2025-10-01',
        requires_calibration: false, calibration_date: null, usage_count: 420,
        notes: 'يستخدم خاصة في مراحل التأهيل المبكرة لتقليل الضغط على المفاصل',
        created_at: new Date('2023-04-10'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'جهاز تقييم التوازن والاستقرار', purpose: 'قياس وتحسين التوازن والحس العضلي المفصلي',
        brand: 'Biodex', serial_number: 'BAL-2024-001', model: 'Balance System SD',
        location: 'صالة التقييم الوظيفي', status: 'excellent',
        purchase_date: '2024-08-22', purchase_price: 22000.00, warranty_expiry: '2027-08-22',
        last_maintenance_date: '2025-03-01', next_maintenance_date: '2025-09-01',
        requires_calibration: true, calibration_date: '2025-03-01', usage_count: 60,
        notes: 'يستخدم في تقييم التوازن قبل السماح باللاعبين بالعودة للمنافسة',
        created_at: new Date('2024-08-22'), updated_at: new Date(),
      },
    ];

    const equipmentIds = [];
    for (const equip of equipment) {
      const [result] = await seq.query(
        `INSERT INTO equipment (club_id, name, purpose, brand, serial_number, model, location, status, purchase_date, purchase_price, warranty_expiry, last_maintenance_date, next_maintenance_date, requires_calibration, calibration_date, usage_count, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        { replacements: [equip.club_id, equip.name, equip.purpose, equip.brand, equip.serial_number, equip.model, equip.location, equip.status, equip.purchase_date, equip.purchase_price, equip.warranty_expiry, equip.last_maintenance_date, equip.next_maintenance_date, equip.requires_calibration ? 1 : 0, equip.calibration_date, equip.usage_count, equip.notes, equip.created_at, equip.updated_at] }
      );
      equipmentIds.push(result);
    }
    const [[equipResult]] = await seq.query('SELECT COUNT(*) as cnt FROM equipment WHERE club_id = 1');
    console.log(`✅ Equipment: ${equipResult.cnt} records`);

    // ====================================
    // 4. SUPPLIES & MEDICATIONS (12 entries)
    // ====================================
    console.log('\n📌 Seeding supplies...');
    await seq.query('DELETE FROM supply_transactions WHERE club_id = 1');
    await seq.query('DELETE FROM supplies WHERE club_id = 1');

    const supplies = [
      {
        club_id: 1, name: 'ايبوبروفين 400mg', category: 'medication',
        unit: 'علبة', total_quantity: 50, used_quantity: 12, reorder_level: 15,
        expiry_date: '2026-08-01', storage_location: 'خزانة الأدوية - رف A',
        purpose: 'مسكن للألم ومضاد للالتهاب - يستخدم للإصابات الرياضية الحادة',
        manufacturer: 'Gulf Pharmaceutical', barcode: 'IBU-400-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'جرعة البالغين: 400mg 3 مرات يومياً مع الطعام. تجنب لمرضى قرحة المعدة.',
        created_at: new Date('2024-10-01'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'ديكلوفيناك جل 1%', category: 'topical',
        unit: 'أنبوب', total_quantity: 30, used_quantity: 8, reorder_level: 10,
        expiry_date: '2026-05-15', storage_location: 'خزانة الأدوية - رف B',
        purpose: 'مضاد للالتهاب موضعي - للاستخدام على مناطق الإصابة المباشرة',
        manufacturer: 'Novartis', barcode: 'DCL-GEL-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'يُطبق 2-3 مرات يومياً على المنطقة المصابة. يتجنب التطبيق على الجروح المفتوحة.',
        created_at: new Date('2024-09-15'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'باراسيتامول 500mg', category: 'medication',
        unit: 'علبة', total_quantity: 80, used_quantity: 20, reorder_level: 20,
        expiry_date: '2027-01-01', storage_location: 'خزانة الأدوية - رف A',
        purpose: 'خافض للحرارة ومسكن للآلام الخفيفة إلى المتوسطة',
        manufacturer: 'Gulf Pharmaceutical', barcode: 'PCM-500-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'جرعة البالغين: 1-2 قرص كل 4-6 ساعات. الحد الأقصى 8 أقراص يومياً.',
        created_at: new Date('2024-11-01'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'كريم فولتارين', category: 'topical',
        unit: 'أنبوب', total_quantity: 20, used_quantity: 6, reorder_level: 5,
        expiry_date: '2026-09-30', storage_location: 'خزانة الأدوية - رف B',
        purpose: 'مضاد للالتهاب موضعي - فعال لآلام المفاصل والعضلات',
        manufacturer: 'GSK', barcode: 'VLT-CRM-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'يُطبق 3-4 مرات يومياً. مناسب للآلام المزمنة.',
        created_at: new Date('2024-08-20'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'بخاخ مسكن موضعي', category: 'topical',
        unit: 'علبة', total_quantity: 15, used_quantity: 5, reorder_level: 5,
        expiry_date: '2025-12-31', storage_location: 'حقيبة الإسعافات الأولية',
        purpose: 'إسعافات أولية سريعة للإصابات أثناء المباريات',
        manufacturer: 'Mueller Sports Medicine', barcode: 'SPR-ANA-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'للاستخدام الخارجي فقط. يُرش على المنطقة المصابة من مسافة 10-15 سم.',
        created_at: new Date('2024-07-01'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'مرهم مضاد للالتهاب والكدمات', category: 'topical',
        unit: 'أنبوب', total_quantity: 25, used_quantity: 10, reorder_level: 8,
        expiry_date: '2026-03-15', storage_location: 'خزانة الأدوية - رف C',
        purpose: 'علاج الكدمات والالتهابات السطحية',
        manufacturer: 'Arnica Sport', barcode: 'ARN-OIN-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'يُطبق مرتين يومياً. فعال جداً للكدمات الرياضية.',
        created_at: new Date('2024-09-01'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'أشرطة لاصقة طبية (Kinesio Tape)', category: 'consumable',
        unit: 'لفة', total_quantity: 40, used_quantity: 15, reorder_level: 10,
        expiry_date: '2027-06-01', storage_location: 'خزانة المستلزمات - رف D',
        purpose: 'دعم العضلات والمفاصل وتقليل الألم',
        manufacturer: 'Kinesio Tex Gold', barcode: 'KNS-TPE-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'متوفرة بألوان متعددة. تدوم 3-5 أيام على الجلد.',
        created_at: new Date('2024-06-15'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'ضمادات مرنة', category: 'consumable',
        unit: 'لفة', total_quantity: 60, used_quantity: 25, reorder_level: 20,
        expiry_date: '2027-01-01', storage_location: 'خزانة المستلزمات - رف D',
        purpose: 'تغليف الجروح والإصابات ودعم المفاصل',
        manufacturer: 'Hartmann', barcode: 'ELS-BND-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'مرنة وقابلة للامتداد. تستخدم مع المطهرات والشاش.',
        created_at: new Date('2024-05-01'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'أكياس ثلج فوري', category: 'consumable',
        unit: 'كرتون (20 كيس)', total_quantity: 5, used_quantity: 2, reorder_level: 2,
        expiry_date: '2026-12-31', storage_location: 'خزانة المستلزمات - رف E',
        purpose: 'تبريد الإصابات الحادة فوراً في الملعب',
        manufacturer: 'CryoMaxx', barcode: 'ICE-PKT-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'تفعيل فوري بالضغط. تستمر 15-20 دقيقة. للاستخدام مرة واحدة.',
        created_at: new Date('2024-08-01'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'قفازات طبية معقمة', category: 'consumable',
        unit: 'علبة (100 زوج)', total_quantity: 10, used_quantity: 3, reorder_level: 3,
        expiry_date: '2026-06-30', storage_location: 'خزانة المستلزمات - رف F',
        purpose: 'وقاية الطاقم الطبي أثناء التعامل مع الإصابات',
        manufacturer: 'Kimberly-Clark', barcode: 'GLV-MED-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'مصنوعة من اللاتكس. متوفرة بأحجام S/M/L.',
        created_at: new Date('2024-07-15'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'أربطة ضاغطة للكاحل', category: 'consumable',
        unit: 'قطعة', total_quantity: 20, used_quantity: 8, reorder_level: 5,
        expiry_date: '2028-01-01', storage_location: 'خزانة المستلزمات - رف G',
        purpose: 'دعم وتثبيت مفصل الكاحل لمنع الإصابة أو أثناء التأهيل',
        manufacturer: 'Futuro', barcode: 'ANK-BRC-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'قابلة لإعادة الاستخدام بعد الغسيل. أحجام متعددة.',
        created_at: new Date('2024-04-10'), updated_at: new Date(),
      },
      {
        club_id: 1, name: 'محاليل تعقيم وتطهير', category: 'consumable',
        unit: 'زجاجة (500ml)', total_quantity: 15, used_quantity: 5, reorder_level: 5,
        expiry_date: '2026-01-01', storage_location: 'خزانة المستلزمات - رف H',
        purpose: 'تعقيم الجروح والشقوق وتطهير الأدوات الطبية',
        manufacturer: 'Dettol Pro', barcode: 'STR-SOL-001',
        is_controlled_substance: false, requires_prescription: false,
        notes: 'يُخفف بنسبة 1:10 لتعقيم الجلد. للاستخدام المباشر على الجروح.',
        created_at: new Date('2024-09-20'), updated_at: new Date(),
      },
    ];

    const supplyIds = [];
    for (const supply of supplies) {
      const [result] = await seq.query(
        `INSERT INTO supplies (club_id, name, category, unit, total_quantity, used_quantity, reorder_level, expiry_date, storage_location, purpose, manufacturer, barcode, is_controlled_substance, requires_prescription, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        { replacements: [supply.club_id, supply.name, supply.category, supply.unit, supply.total_quantity, supply.used_quantity, supply.reorder_level, supply.expiry_date, supply.storage_location, supply.purpose, supply.manufacturer, supply.barcode, supply.is_controlled_substance ? 1 : 0, supply.requires_prescription ? 1 : 0, supply.notes, supply.created_at, supply.updated_at] }
      );
      supplyIds.push(result);
    }
    const [[supplyResult]] = await seq.query('SELECT COUNT(*) as cnt FROM supplies WHERE club_id = 1');
    console.log(`✅ Supplies: ${supplyResult.cnt} records`);

    // ====================================
    // 5. BODY MEASUREMENTS (8 players, multiple each)
    // ====================================
    console.log('\n📌 Seeding body measurements...');

    // Check if body_measurements table exists
    try {
      await seq.query('SELECT 1 FROM body_measurements LIMIT 1');
      await seq.query('DELETE FROM body_measurements WHERE club_id = 1');

      const playerMeasurements = [
        // أحمد - goalkeeper
        { pid: 29, weight: 80, body_fat: 12.5, muscle_mass: 66, bone_mass: 3.8, water_pct: 61, chest: 102, waist: 82, hip: 96, thigh: 58, calf: 38, arm: 36, inbody: 82, date: '2025-04-01' },
        { pid: 29, weight: 81, body_fat: 11.8, muscle_mass: 67, bone_mass: 3.9, water_pct: 62, chest: 103, waist: 81, hip: 96, thigh: 59, calf: 38, arm: 37, inbody: 84, date: '2025-01-01' },
        // مهاجم
        { pid: 34, weight: 73, body_fat: 9.8, muscle_mass: 62, bone_mass: 3.4, water_pct: 64, chest: 97, waist: 76, hip: 90, thigh: 55, calf: 36, arm: 34, inbody: 88, date: '2025-04-05' },
        { pid: 34, weight: 74, body_fat: 10.2, muscle_mass: 61.5, bone_mass: 3.4, water_pct: 63, chest: 97, waist: 77, hip: 91, thigh: 55, calf: 36, arm: 34, inbody: 87, date: '2025-01-05' },
        // مدافع
        { pid: 33, weight: 82, body_fat: 13.0, muscle_mass: 67, bone_mass: 4.0, water_pct: 60, chest: 104, waist: 85, hip: 98, thigh: 60, calf: 39, arm: 38, inbody: 80, date: '2025-04-03' },
        { pid: 33, weight: 83, body_fat: 13.5, muscle_mass: 66.5, bone_mass: 4.0, water_pct: 59, chest: 104, waist: 86, hip: 99, thigh: 60, calf: 39, arm: 38, inbody: 78, date: '2025-01-03' },
        // وسط
        { pid: 38, weight: 75, body_fat: 10.5, muscle_mass: 63, bone_mass: 3.5, water_pct: 63, chest: 98, waist: 78, hip: 91, thigh: 56, calf: 37, arm: 35, inbody: 86, date: '2025-04-08' },
        { pid: 38, weight: 76, body_fat: 11.0, muscle_mass: 63, bone_mass: 3.5, water_pct: 62, chest: 98, waist: 79, hip: 92, thigh: 56, calf: 37, arm: 35, inbody: 84, date: '2025-01-08' },
        // جناح
        { pid: 40, weight: 70, body_fat: 8.5, muscle_mass: 60, bone_mass: 3.2, water_pct: 65, chest: 94, waist: 74, hip: 88, thigh: 53, calf: 35, arm: 33, inbody: 91, date: '2025-04-02' },
        { pid: 40, weight: 70, body_fat: 9.0, muscle_mass: 59.5, bone_mass: 3.2, water_pct: 64, chest: 94, waist: 75, hip: 88, thigh: 53, calf: 35, arm: 32, inbody: 89, date: '2025-01-02' },
        // مهاجم أجنبي
        { pid: 42, weight: 79, body_fat: 11.2, muscle_mass: 65.5, bone_mass: 3.7, water_pct: 62, chest: 101, waist: 81, hip: 94, thigh: 58, calf: 38, arm: 36, inbody: 85, date: '2025-04-10' },
        { pid: 42, weight: 80, body_fat: 11.8, muscle_mass: 65, bone_mass: 3.7, water_pct: 61, chest: 101, waist: 82, hip: 95, thigh: 57, calf: 37, arm: 36, inbody: 83, date: '2025-01-10' },
        // ظهير
        { pid: 32, weight: 71, body_fat: 9.0, muscle_mass: 60.5, bone_mass: 3.3, water_pct: 64, chest: 95, waist: 75, hip: 89, thigh: 54, calf: 36, arm: 33, inbody: 89, date: '2025-04-06' },
        { pid: 32, weight: 72, body_fat: 9.5, muscle_mass: 60, bone_mass: 3.3, water_pct: 63, chest: 95, waist: 76, hip: 89, thigh: 54, calf: 36, arm: 33, inbody: 87, date: '2025-01-06' },
        // قلب دفاع
        { pid: 31, weight: 85, body_fat: 14.0, muscle_mass: 68, bone_mass: 4.2, water_pct: 59, chest: 106, waist: 88, hip: 100, thigh: 62, calf: 40, arm: 39, inbody: 77, date: '2025-04-04' },
        { pid: 31, weight: 86, body_fat: 14.5, muscle_mass: 67.5, bone_mass: 4.2, water_pct: 58, chest: 106, waist: 89, hip: 100, thigh: 61, calf: 40, arm: 39, inbody: 75, date: '2025-01-04' },
      ];

      for (const m of playerMeasurements) {
        const bmi = (m.weight / Math.pow(1.80, 2)).toFixed(1);
        await seq.query(
          `INSERT INTO body_measurements (club_id, player_id, recorded_by, measured_at, weight, body_fat_pct, muscle_mass_kg, bone_mass_kg, water_pct, chest_cm, waist_cm, hip_cm, thigh_cm, calf_cm, arm_cm, inbody_score, notes, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [1, m.pid, 33, m.date, m.weight, m.body_fat, m.muscle_mass, m.bone_mass, m.water_pct, m.chest, m.waist, m.hip, m.thigh, m.calf, m.arm, m.inbody, 'قياس دوري', new Date(m.date)] }
        );
      }
      const [[measResult]] = await seq.query('SELECT COUNT(*) as cnt FROM body_measurements WHERE club_id = 1');
      console.log(`✅ Body measurements: ${measResult.cnt} records`);
    } catch (e) {
      console.log('⚠️  body_measurements table not found, skipping...');
    }

    // ====================================
    // 6. VITALS (for several players)
    // ====================================
    console.log('\n📌 Seeding vitals...');
    try {
      await seq.query('DELETE FROM vitals WHERE club_id = 1');
      const vitalEntries = [
        { pid: 29, hr: 62, bps: 118, bpd: 76, temp: 36.8, spo2: 98, weight: 80, fatigue: 3, sleep: 8, hrv: 68, hydration: 'excellent', date: '2025-04-15' },
        { pid: 34, hr: 58, bps: 115, bpd: 72, temp: 36.6, spo2: 99, weight: 73, fatigue: 2, sleep: 9, hrv: 75, hydration: 'excellent', date: '2025-04-15' },
        { pid: 33, hr: 70, bps: 125, bpd: 80, temp: 37.0, spo2: 97, weight: 82, fatigue: 5, sleep: 7, hrv: 52, hydration: 'good', date: '2025-04-15' },
        { pid: 38, hr: 65, bps: 120, bpd: 78, temp: 36.9, spo2: 98, weight: 75, fatigue: 4, sleep: 7.5, hrv: 61, hydration: 'good', date: '2025-04-15' },
        { pid: 40, hr: 55, bps: 110, bpd: 68, temp: 36.5, spo2: 99, weight: 70, fatigue: 2, sleep: 8.5, hrv: 82, hydration: 'excellent', date: '2025-04-15' },
        { pid: 49, hr: 102, bps: 130, bpd: 85, temp: 37.2, spo2: 96, weight: 79, fatigue: 8, sleep: 5.5, hrv: 32, hydration: 'poor', date: '2025-04-15' }, // injured player - abnormal vitals
        { pid: 35, hr: 63, bps: 117, bpd: 74, temp: 36.7, spo2: 98, weight: 93, fatigue: 4, sleep: 8, hrv: 65, hydration: 'good', date: '2025-04-15' },
        { pid: 42, hr: 60, bps: 116, bpd: 73, temp: 36.6, spo2: 98, weight: 79, fatigue: 3, sleep: 8, hrv: 70, hydration: 'excellent', date: '2025-04-15' },
        // Previous readings
        { pid: 29, hr: 64, bps: 120, bpd: 78, temp: 36.9, spo2: 98, weight: 81, fatigue: 4, sleep: 7.5, hrv: 65, hydration: 'good', date: '2025-04-01' },
        { pid: 34, hr: 60, bps: 116, bpd: 73, temp: 36.7, spo2: 99, weight: 73.5, fatigue: 3, sleep: 8, hrv: 72, hydration: 'excellent', date: '2025-04-01' },
        { pid: 40, hr: 57, bps: 112, bpd: 69, temp: 36.6, spo2: 99, weight: 70.5, fatigue: 2, sleep: 9, hrv: 80, hydration: 'excellent', date: '2025-04-01' },
        { pid: 38, hr: 67, bps: 122, bpd: 79, temp: 36.8, spo2: 97, weight: 75.5, fatigue: 5, sleep: 7, hrv: 58, hydration: 'good', date: '2025-04-01' },
      ];

      for (const v of vitalEntries) {
        const bmi = v.weight ? (v.weight / Math.pow(1.80, 2)).toFixed(1) : null;
        await seq.query(
          `INSERT INTO vitals (club_id, player_id, recorded_by, recorded_at, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, spo2, weight, bmi, fatigue_level, sleep_hours, hrv, hydration_status, notes, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [1, v.pid, 33, v.date, v.hr, v.bps, v.bpd, v.temp, v.spo2, v.weight, bmi, v.fatigue, v.sleep, v.hrv, v.hydration, 'قياس دوري', new Date(v.date)] }
        );
      }
      const [[vitResult]] = await seq.query('SELECT COUNT(*) as cnt FROM vitals WHERE club_id = 1');
      console.log(`✅ Vitals: ${vitResult.cnt} records`);
    } catch (e) {
      console.log('⚠️  Error seeding vitals:', e.message);
    }

    // ====================================
    // 7. APPOINTMENTS (10 entries)
    // ====================================
    console.log('\n📌 Seeding appointments...');
    try {
      await seq.query('DELETE FROM appointments WHERE club_id = 1');
      const appointments = [
        { player_id: 49, doctor_id: 33, type: 'متابعة إصابة', location: 'عيادة العلاج الطبيعي', date: '2025-04-20', time: '09:00', duration: 60, status: 'scheduled', notes: 'متابعة الرباط الصليبي - جلسة تأهيل أسبوعية', created_by: 32 },
        { player_id: 34, doctor_id: 33, type: 'جلسة تأهيل', location: 'صالة التأهيل', date: '2025-04-21', time: '10:30', duration: 45, status: 'scheduled', notes: 'جلسة تأهيل الفخذ - المرحلة المتوسطة', created_by: 32 },
        { player_id: 35, doctor_id: 33, type: 'متابعة إصابة', location: 'عيادة العلاج الطبيعي', date: '2025-04-22', time: '11:00', duration: 60, status: 'scheduled', notes: 'متابعة الغضروف الهلالي', created_by: 32 },
        { player_id: 40, doctor_id: 33, type: 'جلسة تأهيل', location: 'صالة التأهيل', date: '2025-04-23', time: '09:30', duration: 45, status: 'scheduled', notes: 'جلسة تأهيل وتر أخيل', created_by: 32 },
        { player_id: 41, doctor_id: 33, type: 'متابعة إصابة', location: 'عيادة العلاج الطبيعي', date: '2025-04-24', time: '10:00', duration: 30, status: 'scheduled', notes: 'فحص التواء الكاحل', created_by: 32 },
        { player_id: 29, doctor_id: 33, type: 'فحص دوري', location: 'عيادة الفريق الطبية', date: '2025-04-25', time: '08:30', duration: 45, status: 'scheduled', notes: 'فحص دوري شهري لحارس المرمى', created_by: 32 },
        { player_id: 33, doctor_id: 33, type: 'تقييم أداء', location: 'صالة التقييم الوظيفي', date: '2025-04-20', time: '14:00', duration: 90, status: 'scheduled', notes: 'تقييم الأداء البدني الشامل', created_by: 32 },
        // Completed appointments
        { player_id: 34, doctor_id: 33, type: 'جلسة تأهيل', location: 'صالة التأهيل', date: '2025-04-14', time: '10:30', duration: 45, status: 'completed', notes: 'جلسة تأهيل عضلات الفخذ - اكتملت بنجاح', created_by: 32 },
        { player_id: 38, doctor_id: 33, type: 'متابعة إصابة', location: 'عيادة الفريق الطبية', date: '2025-04-13', time: '09:00', duration: 30, status: 'completed', notes: 'متابعة إصابة الكتف - تعافى بالكامل', created_by: 32 },
        { player_id: 49, doctor_id: 33, type: 'جلسة تأهيل', location: 'صالة التأهيل', date: '2025-04-12', time: '09:00', duration: 60, status: 'completed', notes: 'جلسة تأهيل الرباط الصليبي - الأسبوع التاسع', created_by: 32 },
      ];

      for (const appt of appointments) {
        await seq.query(
          `INSERT INTO appointments (club_id, player_id, doctor_id, appointment_type, location, scheduled_date, scheduled_time, duration_minutes, status, notes, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [1, appt.player_id, appt.doctor_id, appt.type, appt.location, appt.date, appt.time, appt.duration, appt.status, appt.notes, appt.created_by, new Date(), new Date()] }
        );
      }
      const [[apptResult]] = await seq.query('SELECT COUNT(*) as cnt FROM appointments WHERE club_id = 1');
      console.log(`✅ Appointments: ${apptResult.cnt} records`);
    } catch (e) {
      console.log('⚠️  Error seeding appointments:', e.message);
    }

    // ====================================
    // 8. PERFORMANCE EVALUATIONS (8 entries)
    // ====================================
    console.log('\n📌 Seeding performance evaluations...');
    try {
      await seq.query('DELETE FROM performances WHERE club_id = 1');
      const performances = [
        { pid: 29, vo2: 58.0, speed: 29.5, strength: 82, endurance: 85, flex: 70, agility: 80, reaction: 250, overall: 84, trend: 'up', compare: 3.5, phys: 88, mental: 85, date: '2025-04-10', notes: 'حارس مرمى ممتاز - تحسن ملحوظ في ردود الفعل', recs: 'الاستمرار في تمارين اللياقة البدنية مع التركيز على تقوية عضلات الظهر' },
        { pid: 34, vo2: 65.0, speed: 34.0, strength: 88, endurance: 90, flex: 82, agility: 92, reaction: 200, overall: 92, trend: 'up', compare: 5.0, phys: 93, mental: 90, date: '2025-04-10', notes: 'مهاجم متميز - سرعة استثنائية', recs: 'تطوير تكتيكات التسديد والتمركز في منطقة الجزاء' },
        { pid: 33, vo2: 60.0, speed: 31.0, strength: 85, endurance: 82, flex: 72, agility: 83, reaction: 230, overall: 83, trend: 'stable', compare: 1.2, phys: 84, mental: 82, date: '2025-04-10', notes: 'مدافع صلب - أداء ثابت', recs: 'تحسين مهارات التمرير الطويل والقراءة التكتيكية' },
        { pid: 38, vo2: 62.0, speed: 33.0, strength: 87, endurance: 88, flex: 80, agility: 88, reaction: 215, overall: 88, trend: 'up', compare: 4.0, phys: 89, mental: 87, date: '2025-04-10', notes: 'لاعب وسط ممتاز - تحسن في الجانب البدني', recs: 'التركيز على تمارين الأيض الهوائي' },
        { pid: 40, vo2: 70.0, speed: 36.0, strength: 85, endurance: 92, flex: 88, agility: 95, reaction: 190, overall: 93, trend: 'up', compare: 6.0, phys: 95, mental: 91, date: '2025-04-10', notes: 'جناح سريع جداً - من أفضل اللاعبين بدنياً', recs: 'الحفاظ على المستوى الحالي مع تطوير المهارات الفنية' },
        { pid: 42, vo2: 63.0, speed: 32.5, strength: 90, endurance: 87, flex: 76, agility: 86, reaction: 220, overall: 88, trend: 'stable', compare: 0.5, phys: 88, mental: 88, date: '2025-04-10', notes: 'مهاجم أجنبي ذو خبرة - أداء عالٍ ومستقر', recs: 'تحسين التعاون مع بقية اللاعبين' },
        { pid: 32, vo2: 64.0, speed: 34.5, strength: 83, endurance: 88, flex: 84, agility: 91, reaction: 205, overall: 89, trend: 'up', compare: 3.8, phys: 90, mental: 88, date: '2025-04-10', notes: 'ظهير أيمن متكامل - تحسن في الجانب الدفاعي', recs: 'تطوير مهارات الارتداد الدفاعي' },
        { pid: 35, vo2: 56.0, speed: 30.0, strength: 88, endurance: 78, flex: 68, agility: 78, reaction: 260, overall: 78, trend: 'down', compare: -8.0, phys: 72, mental: 85, date: '2025-04-10', notes: 'يتأثر بالإصابة حالياً - أداء متراجع', recs: 'الانتظار حتى الشفاء الكامل قبل العودة للتقييم' },
      ];

      for (const p of performances) {
        await seq.query(
          `INSERT INTO performances (club_id, player_id, evaluator_id, evaluation_date, vo2_max, max_speed_kmh, strength_pct, endurance_pct, flexibility_pct, agility_score, reaction_time_ms, overall_score_pct, trend, comparison_previous_pct, physical_readiness_pct, mental_readiness_pct, notes, recommendations, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [1, p.pid, 33, p.date, p.vo2, p.speed, p.strength, p.endurance, p.flex, p.agility, p.reaction, p.overall, p.trend, p.compare, p.phys, p.mental, p.notes, p.recs, new Date(p.date)] }
        );
      }
      const [[perfResult]] = await seq.query('SELECT COUNT(*) as cnt FROM performances WHERE club_id = 1');
      console.log(`✅ Performance evaluations: ${perfResult.cnt} records`);
    } catch (e) {
      console.log('⚠️  Error seeding performances:', e.message);
    }

    // ====================================
    // 9. NOTIFICATIONS (realistic entries)
    // ====================================
    console.log('\n📌 Seeding notifications...');
    try {
      await seq.query('DELETE FROM notifications WHERE club_id = 1');
      const now = new Date();
      const notifications = [
        { user_id: 32, type: 'injury', title: 'إصابة جديدة مسجلة', body: 'تم تسجيل إصابة جديدة للاعب صالح الشهري: تمزق في الرباط الصليبي الأمامي - الركبة اليمنى - شدة: خطيرة', entity_type: 'injury', is_read: false, priority: 'urgent', created_at: new Date(now.getTime() - 3600000) },
        { user_id: 32, type: 'injury', title: 'إصابة جديدة مسجلة', body: 'تم تسجيل إصابة للاعب كالدون كوليبالي: تمزق في الغضروف الهلالي - الركبة اليسرى - شدة: خطيرة', entity_type: 'injury', is_read: false, priority: 'urgent', created_at: new Date(now.getTime() - 7200000) },
        { user_id: 32, type: 'equipment', title: 'معدات تحتاج صيانة', body: 'جهاز كرايوثيرابي (العلاج بالتبريد) يحتاج صيانة. الموعد المقرر: 2025-04-20', entity_type: 'equipment', is_read: false, priority: 'high', created_at: new Date(now.getTime() - 86400000) },
        { user_id: 32, type: 'supplies', title: 'مستوى منخفض في المخزون', body: 'مستوى مخزون أكياس ثلج فوري وصل للحد الأدنى. الكمية المتبقية: 3 كراتين', entity_type: 'supply', is_read: false, priority: 'medium', created_at: new Date(now.getTime() - 172800000) },
        { user_id: 32, type: 'appointment', title: 'موعد مجدول اليوم', body: 'يوجد 7 مواعيد مجدولة اليوم. الموعد الأول: 09:00 - لاعب صالح الشهري - متابعة إصابة', entity_type: 'appointment', is_read: true, priority: 'medium', created_at: new Date(now.getTime() - 3600000) },
        { user_id: 32, type: 'rehab', title: 'اكتمال جلسة تأهيل', body: 'اكتملت جلسة التأهيل للاعب سلمان الفرج. برنامج: تأهيل خلع الكتف. التقدم: 80%', entity_type: 'rehabilitation', is_read: true, priority: 'low', created_at: new Date(now.getTime() - 10800000) },
        { user_id: 32, type: 'injury', title: 'تحديث حالة إصابة', body: 'تم تحديث حالة إصابة لاعب متعب المفرج إلى: متعافى. العودة للتدريبات بتاريخ 2025-02-01', entity_type: 'injury', is_read: true, priority: 'medium', created_at: new Date(now.getTime() - 259200000) },
        { user_id: 33, type: 'appointment', title: 'مواعيدك اليوم', body: 'لديك 5 مواعيد مجدولة اليوم. الأول: 09:00 - متابعة الرباط الصليبي للاعب صالح الشهري', entity_type: 'appointment', is_read: false, priority: 'high', created_at: new Date(now.getTime() - 1800000) },
        { user_id: 33, type: 'vitals', title: 'مؤشرات حيوية غير طبيعية', body: 'مؤشرات حيوية غير طبيعية للاعب صالح الشهري: معدل القلب 102 (مرتفع) - مستوى التعب 8/10 (مرتفع جداً)', entity_type: 'vital', is_read: false, priority: 'urgent', created_at: new Date(now.getTime() - 5400000) },
        { user_id: 32, type: 'system', title: 'ترحيب بالنظام', body: 'مرحباً بك في نظام إدارة الصحة الرياضية SMIS. النظام يعمل بكامل طاقته.', entity_type: null, is_read: true, priority: 'low', created_at: new Date(now.getTime() - 2592000000) },
      ];

      for (const notif of notifications) {
        await seq.query(
          `INSERT INTO notifications (club_id, user_id, type, title, body, related_entity_type, is_read, priority, created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
          { replacements: [1, notif.user_id, notif.type, notif.title, notif.body, notif.entity_type, notif.is_read ? 1 : 0, notif.priority, notif.created_at] }
        );
      }
      const [[notifResult]] = await seq.query('SELECT COUNT(*) as cnt FROM notifications WHERE club_id = 1');
      console.log(`✅ Notifications: ${notifResult.cnt} records`);
    } catch (e) {
      console.log('⚠️  Error seeding notifications:', e.message);
    }

    // ====================================
    // 10. AUDIT LOGS (activity log entries)
    // ====================================
    console.log('\n📌 Seeding audit logs...');
    try {
      await seq.query('DELETE FROM audit_logs WHERE club_id = 1');
      const now = new Date();
      const logs = [
        { user_id: 33, user_name: 'د. خالد', action: 'CREATE', entity_type: 'injury', entity_id: injuryRows[0].id, new_values: JSON.stringify({ player: 'صالح الشهري', injury_type: 'تمزق في الرباط الصليبي الأمامي', severity: 'severe' }), created_at: new Date(now.getTime() - 3600000) },
        { user_id: 33, user_name: 'د. خالد', action: 'CREATE', entity_type: 'injury', entity_id: injuryRows[1].id, new_values: JSON.stringify({ player: 'علي البليهي', injury_type: 'إجهاد عضلي', severity: 'moderate' }), created_at: new Date(now.getTime() - 7200000) },
        { user_id: 33, user_name: 'د. خالد', action: 'CREATE', entity_type: 'vital', entity_id: 1, new_values: JSON.stringify({ player: 'صالح الشهري', heart_rate: 102, fatigue_level: 8 }), created_at: new Date(now.getTime() - 5400000) },
        { user_id: 32, user_name: 'المدير', action: 'CREATE', entity_type: 'appointment', entity_id: 1, new_values: JSON.stringify({ player: 'صالح الشهري', type: 'متابعة إصابة', date: '2025-04-20' }), created_at: new Date(now.getTime() - 86400000) },
        { user_id: 33, user_name: 'د. خالد', action: 'UPDATE', entity_type: 'injury', entity_id: injuryRows[2].id, old_values: JSON.stringify({ status: 'recovering' }), new_values: JSON.stringify({ status: 'closed', actual_recovery_days: 88 }), created_at: new Date(now.getTime() - 172800000) },
        { user_id: 33, user_name: 'د. خالد', action: 'CREATE', entity_type: 'rehabilitation', entity_id: 1, new_values: JSON.stringify({ player: 'صالح الشهري', program: 'برنامج تأهيل الرباط الصليبي' }), created_at: new Date(now.getTime() - 259200000) },
        { user_id: 32, user_name: 'المدير', action: 'CREATE', entity_type: 'equipment', entity_id: 1, new_values: JSON.stringify({ name: 'جهاز الموجات فوق الصوتية', status: 'excellent' }), created_at: new Date(now.getTime() - 345600000) },
        { user_id: 32, user_name: 'المدير', action: 'VIEW', entity_type: 'dashboard', entity_id: null, new_values: JSON.stringify({ page: 'لوحة التحكم' }), created_at: new Date(now.getTime() - 1800000) },
        { user_id: 33, user_name: 'د. خالد', action: 'UPDATE', entity_type: 'rehabilitation', entity_id: 1, old_values: JSON.stringify({ progress_pct: 25 }), new_values: JSON.stringify({ progress_pct: 35 }), created_at: new Date(now.getTime() - 3600000 * 3) },
        { user_id: 34, user_name: 'أخصائي التغذية', action: 'VIEW', entity_type: 'measurements', entity_id: null, new_values: JSON.stringify({ page: 'قياسات الجسم' }), created_at: new Date(now.getTime() - 3600000 * 4) },
      ];

      for (const log of logs) {
        await seq.query(
          `INSERT INTO audit_logs (club_id, user_id, user_name, action, entity_type, entity_id, old_values, new_values, ip_address, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [1, log.user_id, log.user_name, log.action, log.entity_type, log.entity_id || null, log.old_values || null, log.new_values || null, '127.0.0.1', log.created_at] }
        );
      }
      const [[logResult]] = await seq.query('SELECT COUNT(*) as cnt FROM audit_logs WHERE club_id = 1');
      console.log(`✅ Audit logs: ${logResult.cnt} records`);
    } catch (e) {
      console.log('⚠️  Error seeding audit logs:', e.message);
    }

    console.log('\n🎉 All data seeded successfully!');
    console.log('\n📊 Summary:');
    const [[{ injuries: injCount }]] = await seq.query('SELECT COUNT(*) as injuries FROM injuries WHERE club_id = 1');
    const [[{ rehab: rehabCount }]] = await seq.query('SELECT COUNT(*) as rehab FROM rehabilitation_programs WHERE club_id = 1');
    const [[{ equip: equipCount }]] = await seq.query('SELECT COUNT(*) as equip FROM equipment WHERE club_id = 1');
    const [[{ supplies: supCount }]] = await seq.query('SELECT COUNT(*) as supplies FROM supplies WHERE club_id = 1');
    console.log(`  - Injuries: ${injCount}`);
    console.log(`  - Rehab Programs: ${rehabCount}`);
    console.log(`  - Equipment: ${equipCount}`);
    console.log(`  - Supplies: ${supCount}`);

    await seq.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedAll();
