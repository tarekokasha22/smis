'use strict';

module.exports = {
  async up(queryInterface) {
    // Player IDs: 10 = Reece James, 6 = John Stones, 15 = Phil Foden
    // Injury IDs (from demo-injuries seeder, in order): 1 = Stones hamstring, 2 = James ACL, 3 = Kane ankle, 4 = Foden calf
    // User IDs: 3 = Sarah Mitchell (physio), 4 = David Mills (coach)

    const rehabilitationPrograms = [
      {
        club_id: 1,
        player_id: 10,      // Reece James
        injury_id: 2,       // ACL Tear
        program_name: 'ACL Rehabilitation Protocol',
        phase: 2,
        phase_label: 'Phase 2 — Strength & Stability',
        progress_pct: 35,
        start_date: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0],
        expected_end_date: new Date(Date.now() + 159 * 86400000).toISOString().split('T')[0],
        actual_end_date: null,
        therapist_id: 3,
        status: 'active',
        goals: 'Restore full knee stability and quadriceps strength before progressing to running phase',
        exercises_description: 'Isometric quad contractions, leg press (low load), balance board, hydrotherapy walking',
        notes: 'Good compliance and effort. Pain well-managed. Progressing within phase 2 milestones.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 6,       // John Stones
        injury_id: 1,       // Hamstring Strain
        program_name: 'Hamstring Rehabilitation Protocol',
        phase: 3,
        phase_label: 'Phase 3 — Running & Agility',
        progress_pct: 70,
        start_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
        expected_end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        actual_end_date: null,
        therapist_id: 3,
        status: 'active',
        goals: 'Return to full team training and restore pre-injury sprint capacity',
        exercises_description: 'Nordic hamstring curls, progressive running programme (50–80%), agility ladder, change of direction drills',
        notes: 'On track for return to light group training next week. Excellent response to load progression.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 15,      // Phil Foden
        injury_id: 4,       // Calf Tightness
        program_name: 'Calf Strain Rehabilitation',
        phase: 4,
        phase_label: 'Phase 4 — Return to Play',
        progress_pct: 90,
        start_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
        expected_end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        actual_end_date: null,
        therapist_id: 3,
        status: 'active',
        goals: 'Full return to match fitness with sustained calf flexibility and load tolerance',
        exercises_description: 'Progressive calf raises, explosive sprint drills (90–100%), full training integration with monitoring',
        notes: 'Near full recovery. Participating in modified training. Final clearance assessment scheduled.',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('rehabilitation_programs', rehabilitationPrograms);

    const rehabSessions = [
      // Sessions for Reece James (program_id: 1, player_id: 10)
      {
        club_id: 1,
        program_id: 1,
        player_id: 10,
        therapist_id: 3,
        session_date: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0],
        duration_minutes: 45,
        session_type: 'Initial Assessment',
        exercises_done: 'Comprehensive knee assessment, ROM measurement, pain scale recording',
        pain_level: 6,
        progress_notes: 'Program commenced. ROM limited to 60 degrees. Pain manageable.',
        attendance: 'attended',
        created_at: new Date(),
      },
      {
        club_id: 1,
        program_id: 1,
        player_id: 10,
        therapist_id: 3,
        session_date: new Date(Date.now() - 17 * 86400000).toISOString().split('T')[0],
        duration_minutes: 60,
        session_type: 'Physiotherapy',
        exercises_done: 'Isometric quad sets, straight leg raises, ice treatment',
        pain_level: 5,
        progress_notes: 'Swelling reducing. Quad activation improving.',
        attendance: 'attended',
        created_at: new Date(),
      },
      {
        club_id: 1,
        program_id: 1,
        player_id: 10,
        therapist_id: 3,
        session_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
        duration_minutes: 60,
        session_type: 'Strength Training',
        exercises_done: 'Leg press (low load), hamstring curls, balance board',
        pain_level: 3,
        progress_notes: 'Good strength gains. Phase 2 exercises introduced.',
        attendance: 'attended',
        created_at: new Date(),
      },
      {
        club_id: 1,
        program_id: 1,
        player_id: 10,
        therapist_id: 3,
        session_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        duration_minutes: 60,
        session_type: 'Hydrotherapy',
        exercises_done: 'Pool walking, water resistance exercises, range of motion',
        pain_level: 2,
        progress_notes: 'ROM now 110 degrees. Loading tolerance improving well.',
        attendance: 'attended',
        created_at: new Date(),
      },
      // Sessions for John Stones (program_id: 2, player_id: 6)
      {
        club_id: 1,
        program_id: 2,
        player_id: 6,
        therapist_id: 3,
        session_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
        duration_minutes: 45,
        session_type: 'Initial Assessment',
        exercises_done: 'Hamstring assessment, pain mapping, baseline strength test',
        pain_level: 5,
        progress_notes: 'Grade II confirmed. Phase 1 rest protocol commenced.',
        attendance: 'attended',
        created_at: new Date(),
      },
      {
        club_id: 1,
        program_id: 2,
        player_id: 6,
        therapist_id: 3,
        session_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        duration_minutes: 60,
        session_type: 'Strengthening',
        exercises_done: 'Nordic curls (eccentric), bridges, light jogging assessment',
        pain_level: 2,
        progress_notes: 'Good strength gains. Progressed to phase 3 running programme.',
        attendance: 'attended',
        created_at: new Date(),
      },
      // Sessions for Phil Foden (program_id: 3, player_id: 15)
      {
        club_id: 1,
        program_id: 3,
        player_id: 15,
        therapist_id: 3,
        session_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
        duration_minutes: 45,
        session_type: 'Initial Assessment',
        exercises_done: 'Calf assessment, flexibility testing, loading assessment',
        pain_level: 3,
        progress_notes: 'Mild calf strain confirmed. Load management plan initiated.',
        attendance: 'attended',
        created_at: new Date(),
      },
      {
        club_id: 1,
        program_id: 3,
        player_id: 15,
        therapist_id: 3,
        session_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        duration_minutes: 60,
        session_type: 'Return to Training',
        exercises_done: 'Calf raises, sprint drills at 75%, partial group training',
        pain_level: 1,
        progress_notes: 'Excellent progress. Almost fully recovered. Phase 4 exercises introduced.',
        attendance: 'attended',
        created_at: new Date(),
      },
      {
        club_id: 1,
        program_id: 3,
        player_id: 15,
        therapist_id: 3,
        session_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        duration_minutes: 60,
        session_type: 'Return to Play Assessment',
        exercises_done: 'Full sprint testing, explosive movements, full training participation',
        pain_level: 0,
        progress_notes: 'Pain-free. Explosive speed maintained. Final clearance pending.',
        attendance: 'attended',
        created_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('rehab_sessions', rehabSessions);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('rehab_sessions', { club_id: 1 });
    await queryInterface.bulkDelete('rehabilitation_programs', { club_id: 1 });
  },
};
