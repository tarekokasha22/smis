// Demo mock data — used automatically when the backend is unreachable

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString();

// ── Dashboard ──────────────────────────────────────────────────────────────

const dashboardStats = {
  players: { total: 22, injured: 2, ready: 18, suspended: 2 },
  injuries: { active: 2, avgRecoveryDays: 18, recurring: 1 },
  appointments: { today: 3, thisWeek: 9 },
  healthIndex: 85,
  vitals: { avgFatigue: 3.8 },
  clubName: 'Elite FC',
};

const dashboardCharts = {
  availabilityTrend: [
    { week: 'W1', availability: 88 },
    { week: 'W2', availability: 86 },
    { week: 'W3', availability: 91 },
    { week: 'W4', availability: 89 },
    { week: 'W5', availability: 85 },
    { week: 'W6', availability: 92 },
    { week: 'W7', availability: 90 },
    { week: 'W8', availability: 87 },
    { week: 'W9', availability: 94 },
    { week: 'W10', availability: 89 },
    { week: 'W11', availability: 86 },
    { week: 'W12', availability: 83 },
  ],
  playerStatusChart: [
    { name: 'ready', value: 18 },
    { name: 'injured', value: 2 },
    { name: 'suspended', value: 2 },
  ],
  injuriesByAreaChart: [
    { area: 'knee', count: 3 },
    { area: 'ankle', count: 2 },
    { area: 'hamstring', count: 2 },
    { area: 'calf', count: 1 },
    { area: 'shoulder', count: 1 },
  ],
  injuriesByWeekChart: [
    { week: 'W5', injuries: 1 },
    { week: 'W6', injuries: 1 },
    { week: 'W7', injuries: 0 },
    { week: 'W8', injuries: 2 },
    { week: 'W9', injuries: 1 },
    { week: 'W10', injuries: 1 },
    { week: 'W11', injuries: 0 },
    { week: 'W12', injuries: 2 },
  ],
  injuriesByMechanismChart: [
    { name: 'collision', value: 3 },
    { name: 'overuse', value: 3 },
    { name: 'twist', value: 2 },
    { name: 'fall', value: 1 },
  ],
  performanceRadar: [
    { metric: 'speed', value: 82 },
    { metric: 'strength', value: 79 },
    { metric: 'endurance', value: 84 },
    { metric: 'agility', value: 81 },
    { metric: 'technique', value: 86 },
    { metric: 'teamwork', value: 89 },
  ],
  vitalsChart: Array.from({ length: 30 }, (_, i) => ({
    date: daysAgo(29 - i).slice(0, 10),
    heartRate: 64 + Math.round(Math.sin(i * 0.4) * 5 + Math.random() * 3),
  })),
};

const dashboardAlerts = {
  alerts: [
    {
      type: 'warning',
      category: 'injury',
      title: 'Player in Recovery Phase',
      message: 'John Stones - hamstring strain - expected return in 14 days',
    },
    {
      type: 'danger',
      category: 'injury',
      title: 'Critical Injury Needs Monitoring',
      message: 'Reece James - knee ACL injury - training restricted',
    },
    {
      type: 'info',
      category: 'appointment',
      title: 'Medical Appointments Today',
      message: '3 appointments scheduled today - first at 09:00',
    },
    {
      type: 'warning',
      category: 'supply',
      title: 'Low Supply Warning',
      message: 'Ibuprofen tablets and sports tape stock reached minimum level - reorder recommended',
    },
  ],
};

const dashboardActivity = [
  {
    type: 'injury',
    title: 'New Injury Recorded',
    description: 'John Stones — hamstring strain grade II',
    created_at: daysAgo(1),
  },
  {
    type: 'rehab',
    title: 'Rehabilitation Session Completed',
    description: 'Reece James — physiotherapy session #5',
    created_at: daysAgo(1),
  },
  {
    type: 'vital',
    title: 'Vitals Recorded',
    description: 'Vitals measured for 18 players',
    created_at: daysAgo(2),
  },
  {
    type: 'performance',
    title: 'Weekly Performance Assessment',
    description: 'Weekly performance report submitted for the squad',
    created_at: daysAgo(2),
  },
  {
    type: 'rehab',
    title: 'Rehabilitation Program Started',
    description: 'Phil Foden — calf tightness rehabilitation program',
    created_at: daysAgo(3),
  },
  {
    type: 'injury',
    title: 'Training Ground Injury',
    description: 'Harry Kane — ankle sprain during training session',
    created_at: daysAgo(4),
  },
];

const todayAppointments = [
  { time: '09:00:00', type: 'Injury Follow-up', player: { name: 'John Stones', number: 5 } },
  { time: '10:30:00', type: 'Routine Check', player: { name: 'Harry Kane', number: 9 } },
  { time: '14:00:00', type: 'Physiotherapy Session', player: { name: 'Reece James', number: 24 } },
];

// ── Players ────────────────────────────────────────────────────────────────

const players = [
  { id: 1,  name: 'Jordan Pickford',        nationality: 'EN', position: 'goalkeeper', status: 'ready',     jersey_number: 1,  date_of_birth: '1994-03-07', is_active: true, photo_url: null },
  { id: 2,  name: 'Nick Pope',              nationality: 'EN', position: 'goalkeeper', status: 'ready',     jersey_number: 23, date_of_birth: '1992-04-19', is_active: true, photo_url: null },
  { id: 3,  name: 'Aaron Ramsdale',         nationality: 'EN', position: 'goalkeeper', status: 'ready',     jersey_number: 35, date_of_birth: '1998-05-14', is_active: true, photo_url: null },
  { id: 4,  name: 'Trent Alexander-Arnold', nationality: 'EN', position: 'defender',   status: 'ready',     jersey_number: 66, date_of_birth: '1998-10-07', is_active: true, photo_url: null },
  { id: 5,  name: 'Kyle Walker',            nationality: 'EN', position: 'defender',   status: 'ready',     jersey_number: 2,  date_of_birth: '1990-05-28', is_active: true, photo_url: null },
  { id: 6,  name: 'John Stones',            nationality: 'EN', position: 'defender',   status: 'injured',   jersey_number: 5,  date_of_birth: '1994-05-28', is_active: true, photo_url: null },
  { id: 7,  name: 'Harry Maguire',          nationality: 'EN', position: 'defender',   status: 'ready',     jersey_number: 15, date_of_birth: '1993-03-05', is_active: true, photo_url: null },
  { id: 8,  name: 'Luke Shaw',              nationality: 'EN', position: 'defender',   status: 'suspended', jersey_number: 33, date_of_birth: '1995-07-12', is_active: true, photo_url: null },
  { id: 9,  name: 'Ben White',              nationality: 'EN', position: 'defender',   status: 'ready',     jersey_number: 4,  date_of_birth: '1997-10-08', is_active: true, photo_url: null },
  { id: 10, name: 'Reece James',            nationality: 'EN', position: 'defender',   status: 'injured',   jersey_number: 24, date_of_birth: '2000-12-08', is_active: true, photo_url: null },
  { id: 11, name: 'Marc Guehi',             nationality: 'EN', position: 'defender',   status: 'ready',     jersey_number: 6,  date_of_birth: '2000-07-13', is_active: true, photo_url: null },
  { id: 12, name: 'Declan Rice',            nationality: 'EN', position: 'midfielder', status: 'ready',     jersey_number: 41, date_of_birth: '1999-01-14', is_active: true, photo_url: null },
  { id: 13, name: 'Kalvin Phillips',        nationality: 'EN', position: 'midfielder', status: 'ready',     jersey_number: 14, date_of_birth: '1995-12-02', is_active: true, photo_url: null },
  { id: 14, name: 'Jude Bellingham',        nationality: 'EN', position: 'midfielder', status: 'ready',     jersey_number: 22, date_of_birth: '2003-06-29', is_active: true, photo_url: null },
  { id: 15, name: 'Phil Foden',             nationality: 'EN', position: 'midfielder', status: 'ready',     jersey_number: 47, date_of_birth: '2000-05-28', is_active: true, photo_url: null },
  { id: 16, name: 'Jack Grealish',          nationality: 'EN', position: 'midfielder', status: 'ready',     jersey_number: 10, date_of_birth: '1995-09-10', is_active: true, photo_url: null },
  { id: 17, name: 'Mason Mount',            nationality: 'EN', position: 'midfielder', status: 'ready',     jersey_number: 19, date_of_birth: '1999-01-10', is_active: true, photo_url: null },
  { id: 18, name: 'Bukayo Saka',            nationality: 'EN', position: 'forward',    status: 'ready',     jersey_number: 7,  date_of_birth: '2001-09-05', is_active: true, photo_url: null },
  { id: 19, name: 'Harry Kane',             nationality: 'EN', position: 'forward',    status: 'ready',     jersey_number: 9,  date_of_birth: '1993-07-28', is_active: true, photo_url: null },
  { id: 20, name: 'Marcus Rashford',        nationality: 'EN', position: 'forward',    status: 'suspended', jersey_number: 11, date_of_birth: '1997-10-31', is_active: true, photo_url: null },
  { id: 21, name: 'Ollie Watkins',          nationality: 'EN', position: 'forward',    status: 'ready',     jersey_number: 17, date_of_birth: '1995-12-30', is_active: true, photo_url: null },
  { id: 22, name: 'Ivan Toney',             nationality: 'EN', position: 'forward',    status: 'ready',     jersey_number: 18, date_of_birth: '1996-03-16', is_active: true, photo_url: null },
];

const playersMeta = {
  positions: ['goalkeeper', 'defender', 'midfielder', 'forward'],
  statuses: ['ready', 'injured', 'suspended'],
  nationalities: ['EN'],
};

// ── Injuries ───────────────────────────────────────────────────────────────

const injuries = [
  {
    id: 1, player_id: 6, player: { name: 'John Stones', jersey_number: 5 },
    injury_type: 'Hamstring Strain', body_area: 'hamstring', body_side: 'left',
    severity: 'moderate', status: 'active', injury_date: daysAgo(7).slice(0, 10),
    expected_recovery_days: 21, actual_recovery_days: null,
    treating_doctor_id: 2, mechanism: 'overuse', occurred_during: 'training',
    description: 'Grade II hamstring strain in the left posterior thigh',
    treatment_plan: 'Rest + physiotherapy sessions, gradual return to training',
  },
  {
    id: 2, player_id: 10, player: { name: 'Reece James', jersey_number: 24 },
    injury_type: 'ACL Knee Injury', body_area: 'knee', body_side: 'right',
    severity: 'severe', status: 'recovering', injury_date: daysAgo(21).slice(0, 10),
    expected_recovery_days: 180, actual_recovery_days: null,
    treating_doctor_id: 2, mechanism: 'collision', occurred_during: 'match',
    description: 'Partial ACL tear in the right knee sustained during match',
    treatment_plan: 'Surgical assessment + intensive physiotherapy over 6 months',
  },
  {
    id: 3, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 },
    injury_type: 'Ankle Sprain', body_area: 'ankle', body_side: 'right',
    severity: 'mild', status: 'active', injury_date: daysAgo(4).slice(0, 10),
    expected_recovery_days: 7, actual_recovery_days: null,
    treating_doctor_id: 2, mechanism: 'twist', occurred_during: 'training',
    description: 'Mild lateral ankle sprain during training session',
    treatment_plan: 'Rest, ice, compression, elevation — return expected within a week',
  },
  {
    id: 4, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 },
    injury_type: 'Calf Tightness', body_area: 'calf', body_side: 'left',
    severity: 'mild', status: 'recovering', injury_date: daysAgo(14).slice(0, 10),
    expected_recovery_days: 21, actual_recovery_days: null,
    treating_doctor_id: 2, mechanism: 'overuse', occurred_during: 'training',
    description: 'Calf tightness and minor strain from overuse',
    treatment_plan: 'Physiotherapy + stretching exercises, load management',
  },
];

// ── Appointments ──────────────────────────────────────────────────────────

const appointments = [
  {
    id: 1, player_id: 6, player: { name: 'John Stones', jersey_number: 5 },
    doctor_id: 2, doctor: { name: 'Dr. James Harrison' },
    appointment_type: 'Injury Follow-up', location: 'Medical Room A',
    scheduled_date: new Date().toISOString().slice(0, 10), scheduled_time: '09:00:00',
    duration_minutes: 45, status: 'scheduled',
    notes: 'Follow-up on hamstring strain — check recovery progress',
    reminder_sent: true,
  },
  {
    id: 2, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 },
    doctor_id: 2, doctor: { name: 'Dr. James Harrison' },
    appointment_type: 'Routine Check', location: 'Medical Room B',
    scheduled_date: new Date().toISOString().slice(0, 10), scheduled_time: '10:30:00',
    duration_minutes: 30, status: 'scheduled',
    notes: 'Routine pre-match health check',
    reminder_sent: true,
  },
  {
    id: 3, player_id: 10, player: { name: 'Reece James', jersey_number: 24 },
    doctor_id: 3, doctor: { name: 'Dr. Sarah Thompson' },
    appointment_type: 'Physiotherapy Session', location: 'Physio Suite',
    scheduled_date: new Date().toISOString().slice(0, 10), scheduled_time: '14:00:00',
    duration_minutes: 60, status: 'scheduled',
    notes: 'ACL rehabilitation physiotherapy — phase 2 exercises',
    reminder_sent: false,
  },
  {
    id: 4, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 },
    doctor_id: 2, doctor: { name: 'Dr. James Harrison' },
    appointment_type: 'Pre-match Assessment', location: 'Medical Room A',
    scheduled_date: daysAgo(2).slice(0, 10), scheduled_time: '11:00:00',
    duration_minutes: 30, status: 'completed',
    notes: 'Standard pre-match assessment — cleared to play',
    reminder_sent: true,
  },
  {
    id: 5, player_id: 18, player: { name: 'Bukayo Saka', jersey_number: 7 },
    doctor_id: 3, doctor: { name: 'Dr. Sarah Thompson' },
    appointment_type: 'Post-match Review', location: 'Medical Room B',
    scheduled_date: daysAgo(3).slice(0, 10), scheduled_time: '16:00:00',
    duration_minutes: 30, status: 'completed',
    notes: 'Post-match review — no concerns identified',
    reminder_sent: true,
  },
  {
    id: 6, player_id: 6, player: { name: 'John Stones', jersey_number: 5 },
    doctor_id: 2, doctor: { name: 'Dr. James Harrison' },
    appointment_type: 'Injury Follow-up', location: 'Medical Room A',
    scheduled_date: daysAgo(5).slice(0, 10), scheduled_time: '09:30:00',
    duration_minutes: 45, status: 'completed',
    notes: 'Initial injury assessment — hamstring grade II confirmed',
    reminder_sent: true,
  },
  {
    id: 7, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 },
    doctor_id: 3, doctor: { name: 'Dr. Sarah Thompson' },
    appointment_type: 'Physiotherapy Session', location: 'Physio Suite',
    scheduled_date: daysFromNow(2).slice(0, 10), scheduled_time: '10:00:00',
    duration_minutes: 60, status: 'scheduled',
    notes: 'Calf tightness rehabilitation session',
    reminder_sent: false,
  },
];

const appointmentsMeta = {
  players: players.map((p) => ({ id: p.id, name: p.name, jersey_number: p.jersey_number })),
  doctors: [
    { id: 2, name: 'Dr. James Harrison' },
    { id: 3, name: 'Dr. Sarah Thompson' },
  ],
  statusOptions: ['scheduled', 'completed', 'cancelled', 'no_show'],
  appointmentTypes: [
    'Routine Check',
    'Injury Follow-up',
    'Physiotherapy Session',
    'Pre-match Assessment',
    'Post-match Review',
  ],
};

const todayAppointmentsFull = appointments.filter((a) =>
  a.scheduled_date === new Date().toISOString().slice(0, 10)
);

// ── Rehabilitation ────────────────────────────────────────────────────────

const rehabilitation = [
  {
    id: 1, player_id: 10, player: { name: 'Reece James', jersey_number: 24 },
    injury_id: 2, program_name: 'ACL Rehab Protocol',
    phase: 2, phase_label: 'Strength & Stability',
    progress_pct: 35, start_date: daysAgo(21).slice(0, 10),
    expected_end_date: daysFromNow(159).slice(0, 10), actual_end_date: null,
    therapist_id: 3, therapist: { name: 'Sarah Mitchell' },
    status: 'active',
    goals: 'Restore full knee stability and strength before progressing to running phase',
    exercises_description: 'Isometric quad exercises, leg press, balance board, pool walking',
    notes: 'Good progress on phase 2 strength work. Pain level manageable.',
    sessions: [],
  },
  {
    id: 2, player_id: 6, player: { name: 'John Stones', jersey_number: 5 },
    injury_id: 1, program_name: 'Hamstring Rehab Protocol',
    phase: 3, phase_label: 'Running & Agility',
    progress_pct: 70, start_date: daysAgo(14).slice(0, 10),
    expected_end_date: daysFromNow(7).slice(0, 10), actual_end_date: null,
    therapist_id: 4, therapist: { name: 'Tom Bradley' },
    status: 'active',
    goals: 'Return to full training and match fitness after hamstring strain',
    exercises_description: 'Nordic hamstring curls, progressive running, agility drills',
    notes: 'Progressing well, on track for return to light training next week.',
    sessions: [],
  },
  {
    id: 3, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 },
    injury_id: 4, program_name: 'Calf Tightness Rehab',
    phase: 4, phase_label: 'Return to Play',
    progress_pct: 90, start_date: daysAgo(14).slice(0, 10),
    expected_end_date: daysFromNow(3).slice(0, 10), actual_end_date: null,
    therapist_id: 3, therapist: { name: 'Sarah Mitchell' },
    status: 'active',
    goals: 'Full return to match fitness with calf flexibility maintained',
    exercises_description: 'Calf raises, explosive sprint drills, full training integration',
    notes: 'Almost fully recovered, participating in partial training sessions.',
    sessions: [],
  },
];

const rehabilitationStats = {
  total: 3,
  active: 3,
  completed: 0,
  paused: 0,
  avgProgress: 65,
};

const rehabilitationTherapists = [
  { id: 3, name: 'Sarah Mitchell', role: 'physiotherapist' },
  { id: 4, name: 'Tom Bradley', role: 'physiotherapist' },
];

// ── Performance ───────────────────────────────────────────────────────────

const performance = [
  {
    id: 1, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 },
    evaluator_id: 4, evaluator: { name: 'Coach David Mills' },
    evaluation_date: daysAgo(7).slice(0, 10),
    vo2_max: 58.2, max_speed_kmh: 32.8, strength_pct: 88, endurance_pct: 90,
    flexibility_pct: 74, agility_score: 84, reaction_time_ms: 195,
    overall_score_pct: 87, trend: 'up', comparison_previous_pct: 3,
    physical_readiness_pct: 91, mental_readiness_pct: 95,
    notes: 'Excellent condition — leading scorer in training matches',
    recommendations: 'Maintain current load, focus on flexibility work',
  },
  {
    id: 2, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 },
    evaluator_id: 4, evaluator: { name: 'Coach David Mills' },
    evaluation_date: daysAgo(7).slice(0, 10),
    vo2_max: 60.1, max_speed_kmh: 34.2, strength_pct: 83, endurance_pct: 88,
    flexibility_pct: 79, agility_score: 91, reaction_time_ms: 178,
    overall_score_pct: 90, trend: 'up', comparison_previous_pct: 5,
    physical_readiness_pct: 94, mental_readiness_pct: 97,
    notes: 'Outstanding performance metrics across all areas',
    recommendations: 'Continue current regime, monitor workload during busy fixture period',
  },
  {
    id: 3, player_id: 18, player: { name: 'Bukayo Saka', jersey_number: 7 },
    evaluator_id: 4, evaluator: { name: 'Coach David Mills' },
    evaluation_date: daysAgo(7).slice(0, 10),
    vo2_max: 57.8, max_speed_kmh: 33.5, strength_pct: 78, endurance_pct: 85,
    flexibility_pct: 83, agility_score: 92, reaction_time_ms: 172,
    overall_score_pct: 86, trend: 'stable', comparison_previous_pct: 1,
    physical_readiness_pct: 89, mental_readiness_pct: 92,
    notes: 'Consistent performer with excellent agility scores',
    recommendations: 'Focus on upper body strength development',
  },
  {
    id: 4, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 },
    evaluator_id: 4, evaluator: { name: 'Coach David Mills' },
    evaluation_date: daysAgo(14).slice(0, 10),
    vo2_max: 55.4, max_speed_kmh: 31.9, strength_pct: 75, endurance_pct: 80,
    flexibility_pct: 82, agility_score: 88, reaction_time_ms: 181,
    overall_score_pct: 79, trend: 'down', comparison_previous_pct: -4,
    physical_readiness_pct: 72, mental_readiness_pct: 85,
    notes: 'Slightly reduced metrics due to calf issue — managing carefully',
    recommendations: 'Gradual return to full training, reassess in one week',
  },
  {
    id: 5, player_id: 12, player: { name: 'Declan Rice', jersey_number: 41 },
    evaluator_id: 4, evaluator: { name: 'Coach David Mills' },
    evaluation_date: daysAgo(7).slice(0, 10),
    vo2_max: 59.3, max_speed_kmh: 31.4, strength_pct: 89, endurance_pct: 92,
    flexibility_pct: 72, agility_score: 85, reaction_time_ms: 188,
    overall_score_pct: 88, trend: 'up', comparison_previous_pct: 2,
    physical_readiness_pct: 93, mental_readiness_pct: 91,
    notes: 'Exceptional defensive work-rate and endurance',
    recommendations: 'Increase flexibility training to reduce injury risk',
  },
  {
    id: 6, player_id: 4, player: { name: 'Trent Alexander-Arnold', jersey_number: 66 },
    evaluator_id: 4, evaluator: { name: 'Coach David Mills' },
    evaluation_date: daysAgo(7).slice(0, 10),
    vo2_max: 56.7, max_speed_kmh: 33.1, strength_pct: 80, endurance_pct: 86,
    flexibility_pct: 78, agility_score: 87, reaction_time_ms: 182,
    overall_score_pct: 84, trend: 'stable', comparison_previous_pct: 0,
    physical_readiness_pct: 87, mental_readiness_pct: 89,
    notes: 'Consistently high performance, reliable fitness levels',
    recommendations: 'Maintain current programme with additional speed endurance work',
  },
];

const performanceMeta = {
  players: players.map((p) => ({ id: p.id, name: p.name })),
  evaluators: [{ id: 4, name: 'Coach David Mills' }],
  trendOptions: ['up', 'stable', 'down'],
};

const performanceTeamAverage = {
  vo2_max: 56.2,
  max_speed_kmh: 32.1,
  strength_pct: 81,
  endurance_pct: 84,
  flexibility_pct: 76,
  agility_score: 83,
  overall_score_pct: 83,
};

// Historical performance records per player (for PlayerDetail PerformanceTab)
const performanceHistory = {
  19: [ // Harry Kane
    { id: 101, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 }, evaluation_date: daysAgo(7).slice(0, 10), vo2_max: 58.2, max_speed_kmh: 32.8, strength_pct: 88, endurance_pct: 90, flexibility_pct: 74, overall_score_pct: 87, physical_readiness_pct: 91, mental_readiness_pct: 95, trend: 'up', recommendations: 'Maintain current load, focus on flexibility work' },
    { id: 102, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 }, evaluation_date: daysAgo(30).slice(0, 10), vo2_max: 57.1, max_speed_kmh: 32.1, strength_pct: 85, endurance_pct: 88, flexibility_pct: 72, overall_score_pct: 84, physical_readiness_pct: 88, mental_readiness_pct: 92, trend: 'stable', recommendations: null },
    { id: 103, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 }, evaluation_date: daysAgo(60).slice(0, 10), vo2_max: 56.4, max_speed_kmh: 31.8, strength_pct: 83, endurance_pct: 86, flexibility_pct: 71, overall_score_pct: 82, physical_readiness_pct: 85, mental_readiness_pct: 90, trend: 'up', recommendations: null },
  ],
  14: [ // Jude Bellingham
    { id: 104, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 }, evaluation_date: daysAgo(7).slice(0, 10), vo2_max: 60.1, max_speed_kmh: 34.2, strength_pct: 83, endurance_pct: 88, flexibility_pct: 79, overall_score_pct: 90, physical_readiness_pct: 94, mental_readiness_pct: 97, trend: 'up', recommendations: 'Monitor workload during busy fixture period' },
    { id: 105, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 }, evaluation_date: daysAgo(30).slice(0, 10), vo2_max: 58.9, max_speed_kmh: 33.8, strength_pct: 80, endurance_pct: 85, flexibility_pct: 77, overall_score_pct: 86, physical_readiness_pct: 90, mental_readiness_pct: 94, trend: 'up', recommendations: null },
  ],
  12: [ // Declan Rice
    { id: 106, player_id: 12, player: { name: 'Declan Rice', jersey_number: 41 }, evaluation_date: daysAgo(7).slice(0, 10), vo2_max: 59.3, max_speed_kmh: 31.4, strength_pct: 89, endurance_pct: 92, flexibility_pct: 72, overall_score_pct: 88, physical_readiness_pct: 93, mental_readiness_pct: 91, trend: 'up', recommendations: 'Increase flexibility training' },
    { id: 107, player_id: 12, player: { name: 'Declan Rice', jersey_number: 41 }, evaluation_date: daysAgo(30).slice(0, 10), vo2_max: 58.1, max_speed_kmh: 30.9, strength_pct: 87, endurance_pct: 90, flexibility_pct: 70, overall_score_pct: 86, physical_readiness_pct: 91, mental_readiness_pct: 89, trend: 'stable', recommendations: null },
  ],
  15: [ // Phil Foden
    { id: 108, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 }, evaluation_date: daysAgo(14).slice(0, 10), vo2_max: 55.4, max_speed_kmh: 31.9, strength_pct: 75, endurance_pct: 80, flexibility_pct: 82, overall_score_pct: 79, physical_readiness_pct: 72, mental_readiness_pct: 85, trend: 'down', recommendations: 'Gradual return to full training, reassess in one week' },
    { id: 109, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 }, evaluation_date: daysAgo(45).slice(0, 10), vo2_max: 57.2, max_speed_kmh: 32.3, strength_pct: 79, endurance_pct: 83, flexibility_pct: 84, overall_score_pct: 83, physical_readiness_pct: 86, mental_readiness_pct: 88, trend: 'stable', recommendations: null },
  ],
};

// Player medication/supply dispense transactions (for PlayerDetail MedicationsTab)
const playerSupplyTransactions = {
  6: [ // John Stones
    { id: 1, supply: { name: 'Ibuprofen 400mg' }, transaction_type: 'dispense', quantity_change: -2, remaining_after: 48, notes: 'Post-injury pain management', transaction_at: daysAgo(7) },
    { id: 2, supply: { name: 'Sports Tape' }, transaction_type: 'dispense', quantity_change: -3, remaining_after: 47, notes: 'Ankle/knee strapping before physio', transaction_at: daysAgo(5) },
    { id: 3, supply: { name: 'Ice Packs' }, transaction_type: 'dispense', quantity_change: -2, remaining_after: 28, notes: 'Post-treatment cryotherapy', transaction_at: daysAgo(3) },
  ],
  10: [ // Reece James
    { id: 4, supply: { name: 'Naproxen 500mg' }, transaction_type: 'dispense', quantity_change: -2, remaining_after: 38, notes: 'Anti-inflammatory for ACL recovery', transaction_at: daysAgo(21) },
    { id: 5, supply: { name: 'Sports Tape' }, transaction_type: 'dispense', quantity_change: -4, remaining_after: 46, notes: 'Knee support strapping', transaction_at: daysAgo(14) },
    { id: 6, supply: { name: 'Paracetamol 500mg' }, transaction_type: 'dispense', quantity_change: -4, remaining_after: 96, notes: 'Pain management during rehab', transaction_at: daysAgo(10) },
  ],
  19: [ // Harry Kane
    { id: 7, supply: { name: 'Ibuprofen 400mg' }, transaction_type: 'dispense', quantity_change: -2, remaining_after: 46, notes: 'Ankle sprain management', transaction_at: daysAgo(4) },
    { id: 8, supply: { name: 'Ice Packs' }, transaction_type: 'dispense', quantity_change: -1, remaining_after: 29, notes: 'Cryotherapy post-training', transaction_at: daysAgo(3) },
  ],
  15: [ // Phil Foden
    { id: 9, supply: { name: 'Paracetamol 500mg' }, transaction_type: 'dispense', quantity_change: -4, remaining_after: 92, notes: 'Calf pain management', transaction_at: daysAgo(14) },
    { id: 10, supply: { name: 'Sports Tape' }, transaction_type: 'dispense', quantity_change: -2, remaining_after: 48, notes: 'Calf compression support', transaction_at: daysAgo(12) },
    { id: 11, supply: { name: 'Magnesium Supplement' }, transaction_type: 'dispense', quantity_change: -30, remaining_after: 270, notes: 'Monthly supplement allocation', transaction_at: daysAgo(7) },
  ],
};

// ── Vitals ────────────────────────────────────────────────────────────────

const vitals = [
  {
    id: 1, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 },
    recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(1),
    heart_rate: 64, blood_pressure_systolic: 118, blood_pressure_diastolic: 76,
    temperature: 36.6, spo2: 99, weight: 89.2, height: 188, bmi: 25.2,
    resting_hr: 58, hrv: 72, sleep_hours: 8.1, fatigue_level: 2, hydration_status: 'good',
    notes: 'All vitals within normal range',
  },
  {
    id: 2, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 },
    recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(1),
    heart_rate: 62, blood_pressure_systolic: 115, blood_pressure_diastolic: 74,
    temperature: 36.5, spo2: 99, weight: 81.0, height: 186, bmi: 23.4,
    resting_hr: 54, hrv: 80, sleep_hours: 8.5, fatigue_level: 2, hydration_status: 'excellent',
    notes: 'Excellent cardiovascular markers',
  },
  {
    id: 3, player_id: 18, player: { name: 'Bukayo Saka', jersey_number: 7 },
    recorded_by: 'Dr. Sarah Thompson', recorded_at: daysAgo(1),
    heart_rate: 66, blood_pressure_systolic: 117, blood_pressure_diastolic: 75,
    temperature: 36.7, spo2: 98, weight: 76.0, height: 178, bmi: 24.0,
    resting_hr: 60, hrv: 68, sleep_hours: 7.5, fatigue_level: 3, hydration_status: 'good',
    notes: 'Slightly elevated fatigue after recent matches',
  },
  {
    id: 4, player_id: 12, player: { name: 'Declan Rice', jersey_number: 41 },
    recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(2),
    heart_rate: 65, blood_pressure_systolic: 120, blood_pressure_diastolic: 78,
    temperature: 36.6, spo2: 98, weight: 82.0, height: 185, bmi: 23.9,
    resting_hr: 59, hrv: 71, sleep_hours: 7.8, fatigue_level: 3, hydration_status: 'good',
    notes: 'Good recovery from previous match',
  },
  {
    id: 5, player_id: 4, player: { name: 'Trent Alexander-Arnold', jersey_number: 66 },
    recorded_by: 'Dr. Sarah Thompson', recorded_at: daysAgo(2),
    heart_rate: 67, blood_pressure_systolic: 116, blood_pressure_diastolic: 73,
    temperature: 36.5, spo2: 99, weight: 79.0, height: 180, bmi: 24.4,
    resting_hr: 61, hrv: 70, sleep_hours: 7.9, fatigue_level: 3, hydration_status: 'good',
    notes: 'Normal post-match vitals',
  },
  {
    id: 6, player_id: 6, player: { name: 'John Stones', jersey_number: 5 },
    recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(2),
    heart_rate: 70, blood_pressure_systolic: 122, blood_pressure_diastolic: 80,
    temperature: 36.8, spo2: 97, weight: 82.0, height: 188, bmi: 23.2,
    resting_hr: 64, hrv: 58, sleep_hours: 7.2, fatigue_level: 5, hydration_status: 'fair',
    notes: 'Elevated fatigue and slightly reduced HRV due to injury',
  },
  {
    id: 7, player_id: 10, player: { name: 'Reece James', jersey_number: 24 },
    recorded_by: 'Dr. Sarah Thompson', recorded_at: daysAgo(3),
    heart_rate: 69, blood_pressure_systolic: 119, blood_pressure_diastolic: 77,
    temperature: 36.7, spo2: 98, weight: 79.0, height: 180, bmi: 24.4,
    resting_hr: 63, hrv: 62, sleep_hours: 7.0, fatigue_level: 4, hydration_status: 'good',
    notes: 'Monitoring closely during rehabilitation',
  },
  {
    id: 8, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 },
    recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(3),
    heart_rate: 67, blood_pressure_systolic: 114, blood_pressure_diastolic: 72,
    temperature: 36.5, spo2: 98, weight: 73.0, height: 171, bmi: 24.9,
    resting_hr: 60, hrv: 66, sleep_hours: 7.4, fatigue_level: 4, hydration_status: 'good',
    notes: 'Managing calf issue, fatigue slightly elevated',
  },
  {
    id: 9, player_id: 16, player: { name: 'Jack Grealish', jersey_number: 10 },
    recorded_by: 'Dr. Sarah Thompson', recorded_at: daysAgo(3),
    heart_rate: 65, blood_pressure_systolic: 117, blood_pressure_diastolic: 74,
    temperature: 36.6, spo2: 99, weight: 76.0, height: 180, bmi: 23.5,
    resting_hr: 58, hrv: 75, sleep_hours: 8.2, fatigue_level: 3, hydration_status: 'good',
    notes: 'Good recovery, well rested',
  },
  {
    id: 10, player_id: 1, player: { name: 'Jordan Pickford', jersey_number: 1 },
    recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(4),
    heart_rate: 63, blood_pressure_systolic: 116, blood_pressure_diastolic: 73,
    temperature: 36.6, spo2: 99, weight: 74.0, height: 182, bmi: 22.4,
    resting_hr: 57, hrv: 76, sleep_hours: 8.0, fatigue_level: 2, hydration_status: 'excellent',
    notes: 'Excellent resting vitals',
  },
  // Historical records — Harry Kane
  { id: 11, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 }, recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(8), heart_rate: 65, blood_pressure_systolic: 119, blood_pressure_diastolic: 77, temperature: 36.6, spo2: 99, weight: 89.0, height: 188, bmi: 25.2, fatigue_level: 3, notes: 'Pre-match check' },
  { id: 12, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 }, recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(15), heart_rate: 66, blood_pressure_systolic: 120, blood_pressure_diastolic: 78, temperature: 36.7, spo2: 98, weight: 89.5, height: 188, bmi: 25.3, fatigue_level: 4, notes: 'Post-match fatigue noted' },
  { id: 13, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 }, recorded_by: 'Sarah Mitchell', recorded_at: daysAgo(22), heart_rate: 63, blood_pressure_systolic: 117, blood_pressure_diastolic: 75, temperature: 36.5, spo2: 99, weight: 88.8, height: 188, bmi: 25.1, fatigue_level: 2, notes: 'Good recovery week' },
  // Historical records — Jude Bellingham
  { id: 14, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 }, recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(8), heart_rate: 61, blood_pressure_systolic: 114, blood_pressure_diastolic: 73, temperature: 36.5, spo2: 99, weight: 81.2, height: 186, bmi: 23.5, fatigue_level: 2, notes: 'Excellent recovery' },
  { id: 15, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 }, recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(15), heart_rate: 63, blood_pressure_systolic: 116, blood_pressure_diastolic: 74, temperature: 36.6, spo2: 98, weight: 81.0, height: 186, bmi: 23.4, fatigue_level: 3, notes: 'Slight fatigue after intensive training week' },
  // Historical records — Reece James
  { id: 16, player_id: 10, player: { name: 'Reece James', jersey_number: 24 }, recorded_by: 'Dr. Sarah Thompson', recorded_at: daysAgo(10), heart_rate: 71, blood_pressure_systolic: 121, blood_pressure_diastolic: 79, temperature: 36.9, spo2: 97, weight: 79.2, height: 180, bmi: 24.4, fatigue_level: 6, notes: 'Elevated markers post-injury — monitoring closely' },
  { id: 17, player_id: 10, player: { name: 'Reece James', jersey_number: 24 }, recorded_by: 'Dr. Sarah Thompson', recorded_at: daysAgo(17), heart_rate: 73, blood_pressure_systolic: 124, blood_pressure_diastolic: 81, temperature: 37.1, spo2: 96, weight: 79.5, height: 180, bmi: 24.5, fatigue_level: 7, notes: 'Day 4 post ACL injury — pain managed' },
  // Historical records — John Stones
  { id: 18, player_id: 6, player: { name: 'John Stones', jersey_number: 5 }, recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(9), heart_rate: 72, blood_pressure_systolic: 123, blood_pressure_diastolic: 81, temperature: 36.9, spo2: 97, weight: 82.2, height: 188, bmi: 23.2, fatigue_level: 6, notes: 'Day 2 post hamstring injury' },
  { id: 19, player_id: 6, player: { name: 'John Stones', jersey_number: 5 }, recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(14), heart_rate: 68, blood_pressure_systolic: 120, blood_pressure_diastolic: 78, temperature: 36.7, spo2: 98, weight: 82.0, height: 188, bmi: 23.2, fatigue_level: 4, notes: 'Start of rehab phase' },
  // Historical records — Declan Rice
  { id: 20, player_id: 12, player: { name: 'Declan Rice', jersey_number: 41 }, recorded_by: 'Dr. James Harrison', recorded_at: daysAgo(9), heart_rate: 64, blood_pressure_systolic: 119, blood_pressure_diastolic: 77, temperature: 36.6, spo2: 99, weight: 82.1, height: 185, bmi: 23.9, fatigue_level: 3, notes: 'Consistent form' },
];

const vitalsOverview = vitals;

const vitalsStats = {
  avgHeartRate: 68,
  avgSpo2: 98,
  avgFatigue: 3.8,
  avgSleep: 7.8,
};

// ── Equipment ─────────────────────────────────────────────────────────────

const equipment = [
  {
    id: 1, name: 'Ultrasound Therapy Device', purpose: 'Soft tissue injury treatment and rehabilitation',
    brand: 'Chattanooga', serial_number: 'CHT-2023-001', model: 'Intelect Mobile 2',
    location: 'Physio Suite', status: 'excellent',
    purchase_date: '2022-06-15', purchase_price: 4200.00, warranty_expiry: '2025-06-15',
    last_maintenance_date: daysAgo(30).slice(0, 10), next_maintenance_date: daysFromNow(60).slice(0, 10),
    requires_calibration: true, usage_count: 312,
    notes: 'Primary treatment device — fully operational',
  },
  {
    id: 2, name: 'Laser Therapy Unit', purpose: 'Low-level laser therapy for pain and inflammation',
    brand: 'BioFlex', serial_number: 'BFX-2022-047', model: 'Pro System 540',
    location: 'Physio Suite', status: 'good',
    purchase_date: '2021-11-10', purchase_price: 6800.00, warranty_expiry: '2024-11-10',
    last_maintenance_date: daysAgo(45).slice(0, 10), next_maintenance_date: daysFromNow(45).slice(0, 10),
    requires_calibration: true, usage_count: 228,
    notes: 'Good working order, service due soon',
  },
  {
    id: 3, name: 'Motion Analysis System', purpose: 'Biomechanical gait and movement analysis',
    brand: 'Vicon', serial_number: 'VCN-2020-019', model: 'Nexus 2.12',
    location: 'Performance Lab', status: 'needs_maintenance',
    purchase_date: '2020-03-22', purchase_price: 28000.00, warranty_expiry: '2023-03-22',
    last_maintenance_date: daysAgo(120).slice(0, 10), next_maintenance_date: daysAgo(30).slice(0, 10),
    requires_calibration: true, usage_count: 94,
    notes: 'Calibration overdue — maintenance required before next use',
  },
  {
    id: 4, name: 'ECG Machine', purpose: 'Cardiac monitoring and pre-participation screening',
    brand: 'GE Healthcare', serial_number: 'GEH-2023-102', model: 'MAC 5500 HD',
    location: 'Medical Room A', status: 'excellent',
    purchase_date: '2023-01-08', purchase_price: 9500.00, warranty_expiry: '2026-01-08',
    last_maintenance_date: daysAgo(14).slice(0, 10), next_maintenance_date: daysFromNow(76).slice(0, 10),
    requires_calibration: false, usage_count: 147,
    notes: 'Excellent condition, recently serviced',
  },
  {
    id: 5, name: 'Body Composition Analyzer', purpose: 'Player body composition and BMI assessment',
    brand: 'InBody', serial_number: 'IBD-2022-083', model: 'InBody 770',
    location: 'Medical Room B', status: 'good',
    purchase_date: '2022-08-20', purchase_price: 7200.00, warranty_expiry: '2025-08-20',
    last_maintenance_date: daysAgo(60).slice(0, 10), next_maintenance_date: daysFromNow(30).slice(0, 10),
    requires_calibration: true, usage_count: 289,
    notes: 'Functioning well, next calibration due shortly',
  },
];

const equipmentStats = {
  total: 5,
  excellent: 2,
  good: 2,
  needs_maintenance: 1,
  out_of_service: 0,
};

const equipmentSuppliesList = [
  {
    id: 1, name: 'Diclofenac Gel', category: 'medication', unit: 'tube',
    total_quantity: 24, used_quantity: 18, reorder_level: 10,
    expiry_date: daysFromNow(180).slice(0, 10), storage_location: 'Medical Cabinet A',
    purpose: 'Anti-inflammatory topical treatment', manufacturer: 'Novartis',
    notes: '75mg/g — standard concentration',
  },
  {
    id: 2, name: 'Ibuprofen Tablets', category: 'medication', unit: 'box',
    total_quantity: 8, used_quantity: 7, reorder_level: 10,
    expiry_date: daysFromNow(90).slice(0, 10), storage_location: 'Medical Cabinet A',
    purpose: 'Oral anti-inflammatory and pain relief', manufacturer: 'Nurofen',
    notes: '400mg tablets — stock running low',
  },
  {
    id: 3, name: 'Betadine Solution', category: 'antiseptic', unit: 'bottle',
    total_quantity: 12, used_quantity: 4, reorder_level: 5,
    expiry_date: daysFromNow(365).slice(0, 10), storage_location: 'Medical Cabinet B',
    purpose: 'Wound disinfection and antiseptic cleansing', manufacturer: 'Mundipharma',
    notes: '10% povidone-iodine solution',
  },
  {
    id: 4, name: 'Sports Tape', category: 'bandaging', unit: 'roll',
    total_quantity: 15, used_quantity: 13, reorder_level: 20,
    expiry_date: daysFromNow(730).slice(0, 10), storage_location: 'Physio Supply Room',
    purpose: 'Joint taping and support for training and matches', manufacturer: 'Mueller',
    notes: '38mm rigid zinc oxide tape — low stock',
  },
  {
    id: 5, name: 'Elastic Bandages', category: 'bandaging', unit: 'pack',
    total_quantity: 30, used_quantity: 8, reorder_level: 15,
    expiry_date: daysFromNow(1095).slice(0, 10), storage_location: 'Physio Supply Room',
    purpose: 'Compression bandaging for sprains and swelling', manufacturer: 'Tubigrip',
    notes: 'Various widths — good stock level',
  },
  {
    id: 6, name: 'Protein Supplement', category: 'nutrition', unit: 'kg',
    total_quantity: 20, used_quantity: 5, reorder_level: 10,
    expiry_date: daysFromNow(240).slice(0, 10), storage_location: 'Nutrition Store',
    purpose: 'Post-training muscle recovery support', manufacturer: 'Optimum Nutrition',
    notes: 'Whey protein isolate — vanilla flavour',
  },
  {
    id: 7, name: 'Creatine', category: 'nutrition', unit: 'kg',
    total_quantity: 5, used_quantity: 4, reorder_level: 3,
    expiry_date: daysAgo(10).slice(0, 10), storage_location: 'Nutrition Store',
    purpose: 'Strength and power supplementation', manufacturer: 'Myprotein',
    notes: 'EXPIRED — do not use, pending disposal',
  },
  {
    id: 8, name: 'Medical Gloves', category: 'ppe', unit: 'box',
    total_quantity: 20, used_quantity: 3, reorder_level: 8,
    expiry_date: daysFromNow(730).slice(0, 10), storage_location: 'Medical Cabinet B',
    purpose: 'Infection control during medical examinations', manufacturer: 'Ansell',
    notes: 'Nitrile examination gloves, size M/L',
  },
];

const equipmentSuppliesStats = {
  total: 8,
  low_stock: 3,
  expired: 1,
};

// ── Users ─────────────────────────────────────────────────────────────────

const users = [
  {
    id: 1, name: 'James Wilson', email: 'admin@elitefc.com',
    role: 'club_admin', phone: '07700900001', is_active: true,
    created_at: daysAgo(365),
  },
  {
    id: 2, name: 'Dr. James Harrison', email: 'doctor@elitefc.com',
    role: 'doctor', phone: '07700900002', is_active: true,
    created_at: daysAgo(365),
  },
  {
    id: 3, name: 'Sarah Mitchell', email: 'physio@elitefc.com',
    role: 'physiotherapist', phone: '07700900003', is_active: true,
    created_at: daysAgo(300),
  },
  {
    id: 4, name: 'David Mills', email: 'coach@elitefc.com',
    role: 'coach', phone: '07700900004', is_active: true,
    created_at: daysAgo(300),
  },
  {
    id: 5, name: 'Emma Clarke', email: 'manager@elitefc.com',
    role: 'manager', phone: '07700900005', is_active: true,
    created_at: daysAgo(280),
  },
];

// ── Notifications ─────────────────────────────────────────────────────────

const notifications = [
  {
    id: 1, title: 'Injury Alert', type: 'danger', is_read: false,
    message: 'John Stones has been recorded with a hamstring strain. Assessment required.',
    created_at: daysAgo(1),
  },
  {
    id: 2, title: 'Appointment Reminder', type: 'info', is_read: false,
    message: '3 medical appointments are scheduled for today. First at 09:00.',
    created_at: daysAgo(0),
  },
  {
    id: 3, title: 'Low Supply Warning', type: 'warning', is_read: true,
    message: 'Ibuprofen tablets and sports tape are below minimum stock levels.',
    created_at: daysAgo(2),
  },
  {
    id: 4, title: 'Equipment Maintenance Due', type: 'warning', is_read: true,
    message: 'Motion Analysis System calibration is overdue. Please schedule maintenance.',
    created_at: daysAgo(3),
  },
  {
    id: 5, title: 'Rehab Milestone Reached', type: 'success', is_read: true,
    message: 'Phil Foden has reached 90% progress in his calf rehabilitation program.',
    created_at: daysAgo(4),
  },
];

// ── Statistics / Analytics ────────────────────────────────────────────────

const statisticsAnalytics = {
  snapshot: {
    totalPlayers: 22,
    readyPlayers: 18,
    injuredPlayers: 4,
    rehabPlayers: 3,
    suspendedPlayers: 2,
    healthIndex: 85,
  },
  injuries: {
    countInPeriod: 14,
    recurrenceRate: 12,
    byType: [
      { name: 'Hamstring Strain', key: 'hamstring_strain', value: 5 },
      { name: 'Ankle Sprain', key: 'ankle_sprain', value: 4 },
      { name: 'ACL Knee Injury', key: 'acl', value: 2 },
      { name: 'Muscle Tear', key: 'muscle_tear', value: 2 },
      { name: 'Fracture', key: 'fracture', value: 1 },
    ],
    byArea: [
      { name: 'knee', key: 'knee', value: 5 },
      { name: 'ankle', key: 'ankle', value: 4 },
      { name: 'hamstring', key: 'hamstring', value: 3 },
      { name: 'back', key: 'back', value: 1 },
      { name: 'shoulder', key: 'shoulder', value: 1 },
    ],
    byPosition: [
      { name: 'midfielder', key: 'midfielder', value: 6 },
      { name: 'defender', key: 'defender', value: 4 },
      { name: 'forward', key: 'forward', value: 3 },
      { name: 'goalkeeper', key: 'goalkeeper', value: 1 },
    ],
    bySeverity: [
      { name: 'mild', key: 'mild', value: 5 },
      { name: 'moderate', key: 'moderate', value: 5 },
      { name: 'severe', key: 'severe', value: 3 },
      { name: 'critical', key: 'critical', value: 1 },
    ],
    byOccasion: [
      { name: 'training', key: 'training', value: 9 },
      { name: 'match', key: 'match', value: 5 },
    ],
    byMechanism: [
      { name: 'overuse', key: 'overuse', value: 6 },
      { name: 'collision', key: 'collision', value: 4 },
      { name: 'twist', key: 'twist', value: 3 },
      { name: 'unknown', key: 'unknown', value: 1 },
    ],
    avgRecoveryByType: [
      { injuryType: 'ACL Knee Injury', avgDays: 45, sampleSize: 2 },
      { injuryType: 'Muscle Tear', avgDays: 30, sampleSize: 2 },
      { injuryType: 'Ankle Sprain', avgDays: 21, sampleSize: 4 },
      { injuryType: 'Hamstring Strain', avgDays: 14, sampleSize: 5 },
      { injuryType: 'Fracture', avgDays: 56, sampleSize: 1 },
    ],
  },
  trainingLoad: {
    injuriesPerPlayerMonth: 0.24,
  },
  rehab: {
    activePrograms: 3,
    completedInPeriod: 9,
    efficiencyRatio: 1.08,
    sessions: {
      total: 54,
      attended: 48,
      missed: 4,
      cancelled: 2,
    },
  },
  availability: {
    weekly: [
      { label: 'July A', availabilityRate: 91.7, available: 22, unavailable: 2 },
      { label: 'July B', availabilityRate: 83.3, available: 20, unavailable: 4 },
      { label: 'August A', availabilityRate: 87.5, available: 21, unavailable: 3 },
      { label: 'August B', availabilityRate: 79.2, available: 19, unavailable: 5 },
      { label: 'September A', availabilityRate: 83.3, available: 20, unavailable: 4 },
      { label: 'September B', availabilityRate: 91.7, available: 22, unavailable: 2 },
      { label: 'October A', availabilityRate: 95.8, available: 23, unavailable: 1 },
      { label: 'October B', availabilityRate: 87.5, available: 21, unavailable: 3 },
      { label: 'November A', availabilityRate: 83.3, available: 20, unavailable: 4 },
      { label: 'November B', availabilityRate: 91.7, available: 22, unavailable: 2 },
    ],
  },
  equipment: {
    byStatus: [
      { name: 'excellent', key: 'excellent', value: 9 },
      { name: 'good', key: 'good', value: 7 },
      { name: 'needs_maintenance', key: 'needs_maintenance', value: 3 },
      { name: 'out_of_service', key: 'out_of_service', value: 1 },
    ],
    topUtilization: [
      { id: 1, name: 'Advanced Stretching Machine', usageCount: 91, status: 'excellent', location: 'Main Hall' },
      { id: 2, name: 'Rehabilitation Bike', usageCount: 78, status: 'good', location: 'Rehab Room' },
      { id: 3, name: 'Cold Water Pool', usageCount: 65, status: 'excellent', location: 'Main Hall' },
      { id: 4, name: 'Ultrasound Device', usageCount: 58, status: 'good', location: 'Clinic' },
      { id: 5, name: 'TENS Machine', usageCount: 44, status: 'excellent', location: 'Clinic' },
      { id: 6, name: 'Physiotherapy Bed', usageCount: 41, status: 'good', location: 'Clinic' },
    ],
  },
  supplies: {
    burnByCategory: [
      { category: 'medication', label: 'Medication', quantity: 158 },
      { category: 'consumable', label: 'Consumables', quantity: 224 },
      { category: 'topical', label: 'Topical', quantity: 88 },
      { category: 'supplement', label: 'Supplements', quantity: 72 },
      { category: 'equipment_consumable', label: 'Equipment Consumables', quantity: 38 },
    ],
  },
  appointments: {
    byStatus: [
      { name: 'completed', key: 'completed', value: 32 },
      { name: 'scheduled', key: 'scheduled', value: 8 },
      { name: 'cancelled', key: 'cancelled', value: 4 },
      { name: 'no_show', key: 'no_show', value: 2 },
    ],
  },
  performance: {
    avgScore: 83,
    topPlayers: [
      { id: 14, name: 'Jude Bellingham', overall_score_pct: 90 },
      { id: 19, name: 'Harry Kane', overall_score_pct: 87 },
      { id: 12, name: 'Declan Rice', overall_score_pct: 88 },
    ],
    monthlyTrend: [
      { month: '2024-08', avgScore: 71.5, count: 8 },
      { month: '2024-09', avgScore: 73.2, count: 10 },
      { month: '2024-10', avgScore: 75.8, count: 12 },
      { month: '2024-11', avgScore: 74.9, count: 11 },
      { month: '2024-12', avgScore: 77.3, count: 9 },
      { month: '2025-01', avgScore: 79.1, count: 10 },
      { month: '2025-02', avgScore: 78.4, count: 8 },
      { month: '2025-03', avgScore: 81.2, count: 10 },
    ],
  },
  vitals: {
    avgHeartRate: 68,
    avgFatigue: 3.8,
    avgSleep: 7.8,
    avgSpo2: 98,
    readingsCount: 184,
    abnormalCount: 14,
    abnormalRatePct: 7.6,
  },
  files: {
    byType: [
      { name: 'xray', key: 'xray', value: 18 },
      { name: 'mri', key: 'mri', value: 9 },
      { name: 'report', key: 'report', value: 27 },
      { name: 'lab', key: 'lab', value: 14 },
      { name: 'scan', key: 'scan', value: 6 },
    ],
  },
  bodyMeasurements: {
    recordsInPeriod: 52,
  },
  performanceKpis: {
    overallScore: 76.6,
    physicalReadiness: 80.3,
    mentalReadiness: 73.1,
    vo2Max: 51.8,
    maxSpeed: 30.5,
  },
  performanceRadar: [
    { metric: 'strength', value: 76, fullMark: 100 },
    { metric: 'endurance', value: 81, fullMark: 100 },
    { metric: 'flexibility', value: 69, fullMark: 100 },
    { metric: 'agility', value: 74, fullMark: 100 },
    { metric: 'reaction', value: 83, fullMark: 100 },
  ],
  injuriesByWeek: [
    { week: 'Week 30', value: 1 },
    { week: 'Week 31', value: 3 },
    { week: 'Week 32', value: 2 },
    { week: 'Week 33', value: 0 },
    { week: 'Week 34', value: 2 },
    { week: 'Week 35', value: 1 },
    { week: 'Week 36', value: 3 },
    { week: 'Week 37', value: 1 },
    { week: 'Week 38', value: 0 },
    { week: 'Week 39', value: 1 },
  ],
  meta: {
    dateFrom: '2024-07-01',
    dateTo: '2025-06-30',
    season: '2024-2025',
  },
};

// ── Measurements ─────────────────────────────────────────────────────────

const measurements = [
  {
    id: 1, player_id: 19, player: { name: 'Harry Kane' },
    measured_at: daysAgo(14), weight: 89.2, height: 188, bmi: 25.2,
    body_fat_pct: 11.4, muscle_mass_pct: 49.8,
  },
  {
    id: 2, player_id: 14, player: { name: 'Jude Bellingham' },
    measured_at: daysAgo(14), weight: 81.0, height: 186, bmi: 23.4,
    body_fat_pct: 9.8, muscle_mass_pct: 51.2,
  },
  {
    id: 3, player_id: 12, player: { name: 'Declan Rice' },
    measured_at: daysAgo(14), weight: 82.0, height: 185, bmi: 23.9,
    body_fat_pct: 10.2, muscle_mass_pct: 50.6,
  },
  {
    id: 4, player_id: 18, player: { name: 'Bukayo Saka' },
    measured_at: daysAgo(14), weight: 76.0, height: 178, bmi: 24.0,
    body_fat_pct: 10.8, muscle_mass_pct: 48.9,
  },
  {
    id: 5, player_id: 4, player: { name: 'Trent Alexander-Arnold' },
    measured_at: daysAgo(14), weight: 79.0, height: 180, bmi: 24.4,
    body_fat_pct: 11.0, muscle_mass_pct: 49.4,
  },
];

// ── Audit Logs ────────────────────────────────────────────────────────────

const auditLogs = [
  { id: 1, user: { name: 'James Wilson' }, action: 'CREATE', entity_type: 'Player', entity_id: 22, description: 'Added player Ivan Toney to the squad', ip_address: '192.168.1.1', created_at: daysAgo(1) },
  { id: 2, user: { name: 'Dr. James Harrison' }, action: 'CREATE', entity_type: 'Injury', entity_id: 3, description: 'Recorded ankle sprain for Harry Kane', ip_address: '192.168.1.2', created_at: daysAgo(2) },
  { id: 3, user: { name: 'Sarah Mitchell' }, action: 'UPDATE', entity_type: 'Rehabilitation', entity_id: 2, description: 'Updated rehabilitation progress for John Stones to 70%', ip_address: '192.168.1.3', created_at: daysAgo(3) },
  { id: 4, user: { name: 'Dr. James Harrison' }, action: 'CREATE', entity_type: 'Vital', entity_id: 10, description: 'Recorded vitals for Jordan Pickford', ip_address: '192.168.1.2', created_at: daysAgo(4) },
  { id: 5, user: { name: 'James Wilson' }, action: 'UPDATE', entity_type: 'Player', entity_id: 8, description: 'Updated status of Luke Shaw to suspended', ip_address: '192.168.1.1', created_at: daysAgo(5) },
  { id: 6, user: { name: 'Dr. James Harrison' }, action: 'CREATE', entity_type: 'Appointment', entity_id: 7, description: 'Scheduled physiotherapy session for Phil Foden', ip_address: '192.168.1.2', created_at: daysAgo(6) },
  { id: 7, user: { name: 'Sarah Mitchell' }, action: 'CREATE', entity_type: 'Rehabilitation', entity_id: 3, description: 'Started calf rehabilitation program for Phil Foden', ip_address: '192.168.1.3', created_at: daysAgo(7) },
  { id: 8, user: { name: 'David Mills' }, action: 'CREATE', entity_type: 'Performance', entity_id: 5, description: 'Recorded performance evaluation for Declan Rice', ip_address: '192.168.1.4', created_at: daysAgo(8) },
  { id: 9, user: { name: 'James Wilson' }, action: 'UPDATE', entity_type: 'Equipment', entity_id: 3, description: 'Flagged Motion Analysis System as needs_maintenance', ip_address: '192.168.1.1', created_at: daysAgo(10) },
  { id: 10, user: { name: 'Dr. James Harrison' }, action: 'CREATE', entity_type: 'Injury', entity_id: 2, description: 'Recorded ACL knee injury for Reece James', ip_address: '192.168.1.2', created_at: daysAgo(21) },
];

const auditMeta = {
  users: users,
  entityTypes: ['Player', 'Injury', 'Vital', 'Rehabilitation', 'Equipment', 'Supply', 'Appointment', 'Performance', 'User', 'BodyMeasurement'],
  actionTypes: ['CREATE', 'UPDATE', 'DELETE'],
};

// ── Files ─────────────────────────────────────────────────────────────────

const files = [
  { id: 1, player_id: 6, player: { name: 'John Stones', jersey_number: 5 }, file_name: 'hamstring_mri_stones.pdf', file_type: 'mri', file_size: 2500000, mime_type: 'application/pdf', description: 'MRI scan of left hamstring — grade II strain', uploaded_by: { name: 'Dr. James Harrison' }, is_confidential: false, created_at: daysAgo(7) },
  { id: 2, player_id: 10, player: { name: 'Reece James', jersey_number: 24 }, file_name: 'acl_xray_james.pdf', file_type: 'xray', file_size: 1800000, mime_type: 'application/pdf', description: 'X-ray of right knee — ACL assessment', uploaded_by: { name: 'Dr. James Harrison' }, is_confidential: false, created_at: daysAgo(20) },
  { id: 3, player_id: 10, player: { name: 'Reece James', jersey_number: 24 }, file_name: 'acl_mri_full_james.pdf', file_type: 'mri', file_size: 3200000, mime_type: 'application/pdf', description: 'Full knee MRI — ACL partial tear confirmed', uploaded_by: { name: 'Dr. James Harrison' }, is_confidential: true, created_at: daysAgo(19) },
  { id: 4, player_id: 19, player: { name: 'Harry Kane', jersey_number: 9 }, file_name: 'ankle_scan_kane.pdf', file_type: 'scan', file_size: 1200000, mime_type: 'application/pdf', description: 'Ultrasound scan of right ankle — mild sprain', uploaded_by: { name: 'Dr. James Harrison' }, is_confidential: false, created_at: daysAgo(4) },
  { id: 5, player_id: 15, player: { name: 'Phil Foden', jersey_number: 47 }, file_name: 'calf_physio_report.pdf', file_type: 'report', file_size: 450000, mime_type: 'application/pdf', description: 'Physiotherapy progress report — calf rehabilitation phase 4', uploaded_by: { name: 'Sarah Mitchell' }, is_confidential: false, created_at: daysAgo(10) },
  { id: 6, player_id: 14, player: { name: 'Jude Bellingham', jersey_number: 22 }, file_name: 'lab_results_bellingham.pdf', file_type: 'lab', file_size: 320000, mime_type: 'application/pdf', description: 'Blood work and metabolic panel results', uploaded_by: { name: 'Dr. James Harrison' }, is_confidential: true, created_at: daysAgo(14) },
];

const filesStats = {
  total: 6,
  totalSize: 9470000,
  byType: { mri: 2, xray: 1, scan: 1, report: 1, lab: 1 },
};

// ── URL → mock response map ───────────────────────────────────────────────

// ── Mock auth user ────────────────────────────────────────────────────────

const mockAuthUser = {
  id: 1,
  name: 'James Wilson',
  email: 'admin@elitefc.com',
  role: 'club_admin',
  is_active: true,
};

export const MOCK_RESPONSES = {
  '/auth/login':                   { success: true, data: { user: mockAuthUser, accessToken: 'mock-token-demo', refreshToken: 'mock-refresh-demo' } },
  '/auth/me':                      { success: true, data: mockAuthUser },
  '/dashboard/today-appointments': { success: true, data: todayAppointments },
  '/dashboard/stats':              { success: true, data: dashboardStats },
  '/dashboard/charts':             { success: true, data: dashboardCharts },
  '/dashboard/alerts':             { success: true, data: dashboardAlerts },
  '/dashboard/activity':           { success: true, data: dashboardActivity },
  '/players/meta':                 { success: true, data: playersMeta },
  '/players':                      { success: true, data: players, meta: { total: 22, page: 1, limit: 25, totalPages: 1 } },
  '/injuries':                     { success: true, data: injuries, meta: { total: 4, page: 1, limit: 20, totalPages: 1 } },
  '/appointments/meta':            { success: true, data: appointmentsMeta },
  '/appointments/today':           { success: true, data: todayAppointmentsFull, meta: { total: todayAppointmentsFull.length } },
  '/appointments':                 { success: true, data: appointments, meta: { total: 7, page: 1, limit: 20, totalPages: 1 } },
  '/rehabilitation/stats':         { success: true, data: rehabilitationStats },
  '/rehabilitation/therapists':    { success: true, data: rehabilitationTherapists },
  '/rehabilitation':               { success: true, data: rehabilitation, meta: { total: 3, page: 1, limit: 20, totalPages: 1 } },
  '/performance/meta':             { success: true, data: performanceMeta },
  '/performance/team-average':     { success: true, data: performanceTeamAverage },
  '/performance':                  { success: true, data: performance, meta: { total: 6, page: 1, limit: 20, totalPages: 1 } },
  '/vitals/overview':              { success: true, data: vitalsOverview },
  '/vitals/stats':                 { success: true, data: vitalsStats },
  '/vitals':                       { success: true, data: vitals, meta: { total: 10, page: 1, limit: 20, totalPages: 1 } },
  '/equipment/stats':              { success: true, data: equipmentStats },
  '/equipment/supplies/stats':     { success: true, data: equipmentSuppliesStats },
  '/equipment/supplies/list':      { success: true, data: equipmentSuppliesList, meta: { total: 8 } },
  '/equipment/supplies':           { success: true, data: equipmentSuppliesList, meta: { total: 8 } },
  '/equipment':                    { success: true, data: equipment, meta: { total: 5, page: 1, limit: 20, totalPages: 1 } },
  '/users':                        { success: true, data: users, meta: { total: 5 } },
  '/notifications':                { success: true, data: notifications, meta: { total: 5 } },
  '/statistics/analytics':         { success: true, data: statisticsAnalytics },
  '/measurements':                 { success: true, data: measurements, meta: { total: 5 } },
  '/audit/meta':                   { success: true, data: auditMeta },
  '/audit':                        { success: true, data: auditLogs, meta: { total: 10, page: 1, limit: 20, totalPages: 1 } },
  '/files/stats':                  { success: true, data: filesStats },
  '/files':                        { success: true, data: files, meta: { total: 6 } },
  // Reports endpoints
  '/reports/players':              { success: true, data: players.map(p => ({ id: p.id, name: p.name, number: p.jersey_number, position: p.position, status: p.status })) },
  '/reports/team-health': {
    success: true, data: {
      summary: { totalPlayers: 22, ready: 18, injured: 4, suspended: 2, healthIndex: 85 },
      players: players.map(p => ({ id: p.id, name: p.name, number: p.jersey_number, position: p.position, status: p.status })),
      injuries: injuries.filter(i => i.status !== 'closed'),
    }
  },
  '/reports/injuries': {
    success: true, data: {
      summary: {
        total: 14, avgRecoveryDays: 24,
        bySeverity: { mild: 5, moderate: 5, severe: 3, critical: 1 },
      },
      injuries: injuries.map(i => ({ ...i, player: { ...i.player, number: i.player.jersey_number } })),
    }
  },
  '/reports/rehabilitation': {
    success: true, data: {
      summary: { total: 3, active: 3, completed: 9, paused: 0 },
      programs: rehabilitation.map(r => ({
        ...r,
        player: { name: r.player.name, number: r.player.jersey_number },
        sessionStats: { total: 18, attended: 16, missed: 1, cancelled: 1 },
      })),
    }
  },
  '/reports/vitals': {
    success: true, data: {
      summary: { total: 10, avgHeartRate: 65, avgSpO2: 98, abnormalCount: 1 },
      vitals: vitals.map(v => ({ ...v, player: { name: v.player.name, number: v.player.jersey_number } })),
    }
  },
  '/reports/appointments': {
    success: true, data: {
      summary: { total: 7, scheduled: 3, completed: 3, cancelled: 0, no_show: 1 },
      appointments: appointments.map(a => ({ ...a, player: { name: a.player.name, number: a.player.jersey_number } })),
    }
  },
  '/reports/performance': {
    success: true, data: {
      summary: { total: 6, avgOverallScore: 86, avgReadiness: 89, trendUp: 3, trendDown: 1 },
      performances: performance.map(p => ({ ...p, player: { name: p.player.name, number: p.player.jersey_number } })),
    }
  },
  '/reports/equipment': {
    success: true, data: {
      summary: { total: 5, excellent: 2, good: 2, needs_maintenance: 1, out_of_service: 0, maintenanceDueSoon: 2 },
      equipment,
    }
  },
  '/reports/supplies': {
    success: true, data: {
      summary: { total: 8, lowStock: 3, expiringSoon: 2, expired: 1 },
      supplies: equipmentSuppliesList,
    }
  },
  '/reports/measurements': { success: true, data: { summary: { total: 8 }, measurements } },
  // Misc
  '/injuries/stats':   { success: true, data: { total: 14, active: 4, recovering: 3, closed: 7, avgRecoveryDays: 24, recurrenceRate: 12 } },
  '/injuries/doctors': { success: true, data: [{ id: 2, name: 'Dr. James Harrison' }, { id: 3, name: 'Dr. Sarah Thompson' }] },
  '/measurements/stats': { success: true, data: { total: 8, avgBmi: 24.2, avgBodyFat: 10.9, avgMuscleMass: 40.4 } },
  '/settings': { success: true, data: { clubName: 'Elite FC', timezone: 'UTC', language: 'ar', notificationsEnabled: true } },
};

function getDynamicMock(path) {
  // /players/:id/timeline
  if (/^\/players\/\d+\/timeline$/.test(path)) {
    return { success: true, data: [], meta: { total: 0 } };
  }

  // /vitals/player/:id
  const vitalsPlayerMatch = path.match(/^\/vitals\/player\/(\d+)$/);
  if (vitalsPlayerMatch) {
    const id = parseInt(vitalsPlayerMatch[1]);
    const playerVitals = vitals.filter((v) => v.player_id === id);
    return { success: true, data: { vitals: playerVitals } };
  }

  // /equipment/supplies/:id/transactions  — dispense history
  if (/^\/equipment\/supplies\/\d+\/transactions$/.test(path)) {
    const supplyId = parseInt(path.split('/')[3]);
    const supply = equipmentSuppliesList.find(s => s.id === supplyId) || equipmentSuppliesList[0];
    return {
      success: true,
      data: [
        { id: 1, supply_id: supplyId, supply: { name: supply.name }, transaction_type: 'dispense', quantity_change: -2, remaining_after: supply.total_quantity - supply.used_quantity + 4, notes: 'Dispensed for post-match treatment', transaction_at: daysAgo(3), performed_by: { name: 'Dr. James Harrison' } },
        { id: 2, supply_id: supplyId, supply: { name: supply.name }, transaction_type: 'dispense', quantity_change: -1, remaining_after: supply.total_quantity - supply.used_quantity + 5, notes: 'Training session use', transaction_at: daysAgo(7), performed_by: { name: 'Sarah Mitchell' } },
        { id: 3, supply_id: supplyId, supply: { name: supply.name }, transaction_type: 'restock', quantity_change: 10, remaining_after: supply.total_quantity - supply.used_quantity + 16, notes: 'Weekly restock order received', transaction_at: daysAgo(14), performed_by: { name: 'James Wilson' } },
      ],
      meta: { total: 3 },
    };
  }

  // /equipment/:id/maintenance
  if (/^\/equipment\/\d+\/maintenance$/.test(path)) {
    return {
      success: true,
      data: [
        { id: 1, performed_by: 'External Technician', maintenance_type: 'Calibration', notes: 'Annual calibration completed', performed_at: daysAgo(30), next_due: daysFromNow(60) },
        { id: 2, performed_by: 'James Wilson', maintenance_type: 'Inspection', notes: 'Visual inspection — all clear', performed_at: daysAgo(90), next_due: daysFromNow(30) },
      ],
      meta: { total: 2 },
    };
  }

  // /players/:id
  const playerMatch = path.match(/^\/players\/(\d+)$/);
  if (playerMatch) {
    const id = parseInt(playerMatch[1]);
    const player = players.find((p) => p.id === id) || players[0];
    return {
      success: true,
      data: {
        ...player,
        blood_type: 'O+',
        emergency_contact_name: 'Family Member',
        emergency_contact_phone: '07700900000',
        contract_start: '2022-07-01',
        contract_end: '2025-06-30',
        notes: '',
      },
    };
  }

  // /rehabilitation/:id
  const rehabMatch = path.match(/^\/rehabilitation\/(\d+)$/);
  if (rehabMatch) {
    const id = parseInt(rehabMatch[1]);
    const rehab = rehabilitation.find((r) => r.id === id) || rehabilitation[0];
    return { success: true, data: rehab };
  }

  // /injuries/:id
  const injuryMatch = path.match(/^\/injuries\/(\d+)$/);
  if (injuryMatch) {
    const id = parseInt(injuryMatch[1]);
    const injury = injuries.find((i) => i.id === id) || injuries[0];
    return { success: true, data: injury };
  }

  // /appointments/:id
  const apptMatch = path.match(/^\/appointments\/(\d+)$/);
  if (apptMatch) {
    const id = parseInt(apptMatch[1]);
    const appt = appointments.find((a) => a.id === id) || appointments[0];
    return { success: true, data: appt };
  }

  // /performance/:id
  const perfMatch = path.match(/^\/performance\/(\d+)$/);
  if (perfMatch) {
    const id = parseInt(perfMatch[1]);
    const perf = performance.find((p) => p.id === id) || performance[0];
    return { success: true, data: perf };
  }

  // /vitals/:id
  const vitalsMatch = path.match(/^\/vitals\/(\d+)$/);
  if (vitalsMatch) {
    const id = parseInt(vitalsMatch[1]);
    const vital = vitals.find((v) => v.id === id) || vitals[0];
    return { success: true, data: vital };
  }

  // /equipment/:id
  const equipMatch = path.match(/^\/equipment\/(\d+)$/);
  if (equipMatch) {
    const id = parseInt(equipMatch[1]);
    const eq = equipment.find((e) => e.id === id) || equipment[0];
    return { success: true, data: eq };
  }

  // /equipment/supplies/:id
  const supplyMatch = path.match(/^\/equipment\/supplies\/(\d+)$/);
  if (supplyMatch) {
    const id = parseInt(supplyMatch[1]);
    const supply = equipmentSuppliesList.find((s) => s.id === id) || equipmentSuppliesList[0];
    return { success: true, data: supply };
  }

  // /equipment/supplies/:id/transactions
  if (/^\/equipment\/supplies\/\d+\/transactions$/.test(path)) {
    return { success: true, data: [], meta: { total: 0 } };
  }

  // /equipment/:id/maintenance
  if (/^\/equipment\/\d+\/maintenance$/.test(path)) {
    return {
      success: true,
      data: [
        { id: 1, performed_by: 'External Technician', maintenance_type: 'Calibration', notes: 'Annual calibration completed', performed_at: daysAgo(30), next_due: daysFromNow(60) },
        { id: 2, performed_by: 'James Wilson', maintenance_type: 'Inspection', notes: 'Visual inspection — all clear', performed_at: daysAgo(90), next_due: daysFromNow(30) },
      ],
      meta: { total: 2 },
    };
  }

  // /equipment/supplies/player/:id/transactions — MedicationsTab
  const playerTxMatch = path.match(/^\/equipment\/supplies\/player\/(\d+)\/transactions$/);
  if (playerTxMatch) {
    const id = parseInt(playerTxMatch[1]);
    const txs = playerSupplyTransactions[id] || playerSupplyTransactions[6];
    return { success: true, data: txs, meta: { total: txs.length } };
  }

  // /measurements/player/:id
  const measPlayerMatch = path.match(/^\/measurements\/player\/(\d+)$/);
  if (measPlayerMatch) {
    const id = parseInt(measPlayerMatch[1]);
    const playerMeasurements = measurements.filter((m) => m.player_id === id);
    return { success: true, data: playerMeasurements, meta: { total: playerMeasurements.length } };
  }

  // /measurements/:id
  const measIdMatch = path.match(/^\/measurements\/(\d+)$/);
  if (measIdMatch) {
    const id = parseInt(measIdMatch[1]);
    return { success: true, data: measurements.find(m => m.id === id) || measurements[0] };
  }

  // /performance/player/:id
  const perfPlayerMatch = path.match(/^\/performance\/player\/(\d+)$/);
  if (perfPlayerMatch) {
    const id = parseInt(perfPlayerMatch[1]);
    const result = performanceHistory[id] || performance.filter(p => p.player_id === id);
    const final = result.length ? result : [performance[0]];
    return { success: true, data: final, meta: { total: final.length } };
  }

  // /users/:id
  const userMatch = path.match(/^\/users\/(\d+)$/);
  if (userMatch) {
    const id = parseInt(userMatch[1]);
    return { success: true, data: users.find(u => u.id === id) || users[0] };
  }

  // /reports/player/:id — full medical record
  const reportPlayerMatch = path.match(/^\/reports\/player\/(\d+)$/);
  if (reportPlayerMatch) {
    const id = parseInt(reportPlayerMatch[1]);
    const player = players.find(p => p.id === id) || players[0];
    const pi = injuries.filter(i => i.player_id === id);
    const pv = vitals.filter(v => v.player_id === id);
    const pr = rehabilitation.filter(r => r.player_id === id);
    const pf = files.filter(f => f.player_id === id);
    return {
      success: true,
      data: {
        player: { ...player, number: player.jersey_number, blood_type: 'O+' },
        injuries: pi, vitals: pv, rehabPrograms: pr, files: pf,
        summary: {
          totalInjuries: pi.length,
          activeInjuries: pi.filter(i => i.status === 'active').length,
          totalRehab: pr.length, totalFiles: pf.length,
          latestVitals: pv[0] || null,
        },
      },
    };
  }

  // /files/:id
  const fileIdMatch = path.match(/^\/files\/(\d+)$/);
  if (fileIdMatch) {
    const id = parseInt(fileIdMatch[1]);
    return { success: true, data: files.find(f => f.id === id) || files[0] };
  }

  // /notifications/:id (mark read)
  if (/^\/notifications\/\d+$/.test(path)) {
    return { success: true, data: { marked: true } };
  }

  return null;
}

export function getMockForUrl(url = '') {
  if (!url) return null;
  const path = url.split('?')[0];
  // Exact match first (handles all static routes including /players/meta, etc.)
  if (MOCK_RESPONSES[path]) return MOCK_RESPONSES[path];
  // Dynamic routes with URL parameters
  return getDynamicMock(path);
}
