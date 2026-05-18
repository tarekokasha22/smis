// Demo mock data — used automatically when the backend is unreachable

const today = new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

// ── Dashboard ──────────────────────────────────────────────────────────────

const dashboardStats = {
  players: { total: 32, injured: 4, ready: 25, suspended: 3 },
  injuries: { active: 4, avgRecoveryDays: 21, recurring: 1 },
  appointments: { today: 3, thisWeek: 11 },
  healthIndex: 82,
  vitals: { avgFatigue: 4.2 },
  clubName: 'نادي الهلال الرياضي',
};

const dashboardCharts = {
  availabilityTrend: [
    { week: 'W1', availability: 88 },
    { week: 'W2', availability: 85 },
    { week: 'W3', availability: 90 },
    { week: 'W4', availability: 87 },
    { week: 'W5', availability: 84 },
    { week: 'W6', availability: 91 },
    { week: 'W7', availability: 89 },
    { week: 'W8', availability: 86 },
    { week: 'W9', availability: 93 },
    { week: 'W10', availability: 88 },
    { week: 'W11', availability: 85 },
    { week: 'W12', availability: 82 },
  ],
  playerStatusChart: [
    { name: 'ready', value: 25 },
    { name: 'injured', value: 4 },
    { name: 'suspended', value: 3 },
  ],
  injuriesByAreaChart: [
    { area: 'knee', count: 4 },
    { area: 'ankle', count: 3 },
    { area: 'thigh', count: 3 },
    { area: 'shoulder', count: 2 },
    { area: 'back', count: 1 },
  ],
  injuriesByWeekChart: [
    { week: 'W5', injuries: 1 },
    { week: 'W6', injuries: 2 },
    { week: 'W7', injuries: 0 },
    { week: 'W8', injuries: 3 },
    { week: 'W9', injuries: 1 },
    { week: 'W10', injuries: 2 },
    { week: 'W11', injuries: 1 },
    { week: 'W12', injuries: 4 },
  ],
  injuriesByMechanismChart: [
    { name: 'collision', value: 5 },
    { name: 'overuse', value: 4 },
    { name: 'twist', value: 3 },
    { name: 'fall', value: 2 },
  ],
  performanceRadar: [
    { metric: 'speed', value: 78 },
    { metric: 'strength', value: 72 },
    { metric: 'endurance', value: 80 },
    { metric: 'agility', value: 75 },
    { metric: 'technique', value: 83 },
    { metric: 'teamwork', value: 88 },
  ],
  vitalsChart: Array.from({ length: 30 }, (_, i) => ({
    date: daysAgo(29 - i).slice(0, 10),
    heartRate: 62 + Math.round(Math.sin(i * 0.4) * 6 + Math.random() * 4),
  })),
};

const dashboardAlerts = {
  alerts: [
    {
      type: 'warning',
      category: 'injury',
      title: 'لاعب في مرحلة التعافي',
      message: 'صالح الشهري - تمزق رباط ركبة - متوقع عودة خلال 14 يوم',
    },
    {
      type: 'danger',
      category: 'injury',
      title: 'إصابة حرجة تحتاج متابعة',
      message: 'علي البليهي - إجهاد عضلي شديد في الفخذ - ممنوع التدريب',
    },
    {
      type: 'info',
      category: 'appointment',
      title: 'مواعيد طبية اليوم',
      message: '3 مواعيد مجدولة اليوم - الأول الساعة 09:00',
    },
    {
      type: 'warning',
      category: 'supply',
      title: 'مخزون منخفض',
      message: 'مخزون مسكنات الألم وصل للحد الأدنى - يُنصح بإعادة الطلب',
    },
  ],
};

const dashboardActivity = [
  {
    type: 'injury',
    title: 'إصابة جديدة مسجلة',
    description: 'صالح الشهري — تمزق رباط ركبة يمنى',
    created_at: daysAgo(1),
  },
  {
    type: 'rehab',
    title: 'جلسة تأهيل مكتملة',
    description: 'محمد الشلهوب — جلسة علاج طبيعي #8',
    created_at: daysAgo(1),
  },
  {
    type: 'vital',
    title: 'قياسات حيوية مسجلة',
    description: 'تم قياس المؤشرات الحيوية لـ 24 لاعب',
    created_at: daysAgo(2),
  },
  {
    type: 'performance',
    title: 'تقييم أداء أسبوعي',
    description: 'تم رفع تقرير الأداء الأسبوعي للفريق',
    created_at: daysAgo(2),
  },
  {
    type: 'rehab',
    title: 'بدء برنامج تأهيل',
    description: 'علي البليهي — برنامج تأهيل إجهاد عضلي',
    created_at: daysAgo(3),
  },
  {
    type: 'injury',
    title: 'إصابة في التدريب',
    description: 'يوسف العلاوي — كدمة في الكاحل الأيسر',
    created_at: daysAgo(4),
  },
];

const todayAppointments = [
  { time: '09:00:00', type: 'متابعة إصابة', player: { name: 'صالح الشهري', number: 17 } },
  { time: '10:30:00', type: 'فحص دوري', player: { name: 'خالد العمري', number: 9 } },
  { time: '14:00:00', type: 'جلسة علاج طبيعي', player: { name: 'علي البليهي', number: 4 } },
];

// ── Players ────────────────────────────────────────────────────────────────

const players = [
  { id: 1,  name: 'سعد البريك',       nationality: 'SA', position: 'goalkeeper',  status: 'ready',     jersey_number: 1,  date_of_birth: '1995-03-12', is_active: true, photo_url: null },
  { id: 2,  name: 'ياسر الشهراني',   nationality: 'SA', position: 'defender',    status: 'ready',     jersey_number: 16, date_of_birth: '1992-08-25', is_active: true, photo_url: null },
  { id: 3,  name: 'علي البليهي',      nationality: 'SA', position: 'defender',    status: 'injured',   jersey_number: 4,  date_of_birth: '1993-11-07', is_active: true, photo_url: null },
  { id: 4,  name: 'عبدالعزيز الدوسري',nationality: 'SA', position: 'defender',    status: 'ready',     jersey_number: 5,  date_of_birth: '1997-01-18', is_active: true, photo_url: null },
  { id: 5,  name: 'محمد العمار',      nationality: 'SA', position: 'defender',    status: 'ready',     jersey_number: 3,  date_of_birth: '1999-06-30', is_active: true, photo_url: null },
  { id: 6,  name: 'عمر الشيبي',       nationality: 'SA', position: 'midfielder',  status: 'ready',     jersey_number: 14, date_of_birth: '1996-09-14', is_active: true, photo_url: null },
  { id: 7,  name: 'محمد الشلهوب',    nationality: 'SA', position: 'midfielder',  status: 'ready',     jersey_number: 7,  date_of_birth: '1989-04-05', is_active: true, photo_url: null },
  { id: 8,  name: 'سالم الدوسري',    nationality: 'SA', position: 'midfielder',  status: 'ready',     jersey_number: 11, date_of_birth: '1996-02-19', is_active: true, photo_url: null },
  { id: 9,  name: 'فراس البريكان',   nationality: 'SA', position: 'midfielder',  status: 'suspended', jersey_number: 6,  date_of_birth: '1998-07-22', is_active: true, photo_url: null },
  { id: 10, name: 'محمد الشهري',     nationality: 'SA', position: 'midfielder',  status: 'ready',     jersey_number: 10, date_of_birth: '1994-10-11', is_active: true, photo_url: null },
  { id: 11, name: 'خالد العمري',      nationality: 'SA', position: 'forward',     status: 'ready',     jersey_number: 9,  date_of_birth: '1995-05-03', is_active: true, photo_url: null },
  { id: 12, name: 'صالح الشهري',     nationality: 'SA', position: 'forward',     status: 'injured',   jersey_number: 17, date_of_birth: '1997-12-28', is_active: true, photo_url: null },
  { id: 13, name: 'يوسف العلاوي',    nationality: 'SA', position: 'forward',     status: 'injured',   jersey_number: 19, date_of_birth: '2000-03-15', is_active: true, photo_url: null },
  { id: 14, name: 'عبدالله العمار',  nationality: 'SA', position: 'forward',     status: 'ready',     jersey_number: 22, date_of_birth: '2001-08-09', is_active: true, photo_url: null },
  { id: 15, name: 'نواف العابد',      nationality: 'SA', position: 'forward',     status: 'suspended', jersey_number: 8,  date_of_birth: '1993-06-17', is_active: true, photo_url: null },
  { id: 16, name: 'حسن الشمراني',    nationality: 'SA', position: 'defender',    status: 'ready',     jersey_number: 2,  date_of_birth: '1998-04-22', is_active: true, photo_url: null },
  { id: 17, name: 'تركي الأمير',     nationality: 'SA', position: 'midfielder',  status: 'ready',     jersey_number: 13, date_of_birth: '1999-11-01', is_active: true, photo_url: null },
  { id: 18, name: 'وليد عبدالله',    nationality: 'SA', position: 'goalkeeper',  status: 'ready',     jersey_number: 21, date_of_birth: '2002-01-25', is_active: true, photo_url: null },
];

const playersMeta = {
  positions: ['goalkeeper', 'defender', 'midfielder', 'forward'],
  statuses: ['ready', 'injured', 'suspended'],
  nationalities: ['SA', 'BR', 'AR', 'EG'],
};

// ── Injuries ───────────────────────────────────────────────────────────────

const injuries = [
  {
    id: 1, player_id: 3, player: { name: 'علي البليهي', jersey_number: 4 },
    injury_type: 'إجهاد عضلي شديد', body_area: 'thigh', body_side: 'left',
    severity: 'moderate', status: 'active', injury_date: daysAgo(7).slice(0, 10),
    expected_recovery_days: 21, actual_recovery_days: null,
    treating_doctor_id: 1, mechanism: 'overuse', occurred_during: 'training',
    description: 'إجهاد عضلي من الدرجة الثانية في العضلة الخلفية',
    treatment_plan: 'راحة تامة + علاج طبيعي',
  },
  {
    id: 2, player_id: 12, player: { name: 'صالح الشهري', jersey_number: 17 },
    injury_type: 'تمزق رباط', body_area: 'knee', body_side: 'right',
    severity: 'severe', status: 'recovering', injury_date: daysAgo(14).slice(0, 10),
    expected_recovery_days: 45, actual_recovery_days: null,
    treating_doctor_id: 1, mechanism: 'collision', occurred_during: 'match',
    description: 'تمزق جزئي في الرباط الجانبي للركبة اليمنى',
    treatment_plan: 'تثبيت + علاج طبيعي مكثف لمدة 6 أسابيع',
  },
  {
    id: 3, player_id: 13, player: { name: 'يوسف العلاوي', jersey_number: 19 },
    injury_type: 'كدمة', body_area: 'ankle', body_side: 'left',
    severity: 'mild', status: 'active', injury_date: daysAgo(3).slice(0, 10),
    expected_recovery_days: 7, actual_recovery_days: null,
    treating_doctor_id: 1, mechanism: 'fall', occurred_during: 'training',
    description: 'كدمة في الكاحل الأيسر أثناء التدريب',
    treatment_plan: 'راحة وثلج + مسكنات ألم',
  },
  {
    id: 4, player_id: 7, player: { name: 'محمد الشلهوب', jersey_number: 7 },
    injury_type: 'التهاب وتر', body_area: 'ankle', body_side: 'right',
    severity: 'mild', status: 'recovering', injury_date: daysAgo(21).slice(0, 10),
    expected_recovery_days: 28, actual_recovery_days: null,
    treating_doctor_id: 1, mechanism: 'overuse', occurred_during: 'training',
    description: 'التهاب في وتر أخيل - نتيجة الإرهاق التدريبي',
    treatment_plan: 'علاج طبيعي + تمارين إطالة',
  },
];

// ── URL → mock response map ────────────────────────────────────────────────

export const MOCK_RESPONSES = {
  '/dashboard/stats':             { success: true, data: dashboardStats },
  '/dashboard/charts':            { success: true, data: dashboardCharts },
  '/dashboard/alerts':            { success: true, data: dashboardAlerts },
  '/dashboard/activity':          { success: true, data: dashboardActivity },
  '/dashboard/today-appointments':{ success: true, data: todayAppointments },
  '/players/meta':                { success: true, data: playersMeta },
  '/players':                     { success: true, data: players, meta: { total: 18, page: 1, limit: 20, totalPages: 1 } },
  '/injuries':                    { success: true, data: injuries, meta: { total: 4, page: 1, limit: 20, totalPages: 1 } },
};

export function getMockForUrl(url = '') {
  if (!url) return null;
  const key = Object.keys(MOCK_RESPONSES).find((k) => url.includes(k));
  return key ? MOCK_RESPONSES[key] : null;
}
