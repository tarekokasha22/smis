'use strict';

module.exports = {
  async up(queryInterface) {
    // Player IDs: 19=Harry Kane, 14=Jude Bellingham, 18=Bukayo Saka,
    //             12=Declan Rice, 4=Trent Alexander-Arnold, 16=Jack Grealish
    // Evaluator: user_id 4 = David Mills (coach)

    const today = new Date();
    const daysAgo = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d.toISOString().split('T')[0];
    };

    const performances = [
      {
        club_id: 1,
        player_id: 19,        // Harry Kane
        evaluator_id: 4,
        evaluation_date: daysAgo(7),
        vo2_max: 58.2,
        max_speed_kmh: 32.8,
        strength_pct: 88,
        endurance_pct: 90,
        flexibility_pct: 74,
        agility_score: 84,
        reaction_time_ms: 195,
        overall_score_pct: 87,
        trend: 'up',
        comparison_previous_pct: 3,
        physical_readiness_pct: 91,
        mental_readiness_pct: 95,
        notes: 'Excellent condition — leading scorer in training matches. Ankle sprain well managed.',
        recommendations: 'Maintain current load, add focused flexibility sessions.',
        created_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 14,        // Jude Bellingham
        evaluator_id: 4,
        evaluation_date: daysAgo(7),
        vo2_max: 60.1,
        max_speed_kmh: 34.2,
        strength_pct: 83,
        endurance_pct: 88,
        flexibility_pct: 79,
        agility_score: 91,
        reaction_time_ms: 178,
        overall_score_pct: 90,
        trend: 'up',
        comparison_previous_pct: 5,
        physical_readiness_pct: 94,
        mental_readiness_pct: 97,
        notes: 'Outstanding metrics across all categories. Best performer in squad this week.',
        recommendations: 'Monitor workload during congested fixture period.',
        created_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 18,        // Bukayo Saka
        evaluator_id: 4,
        evaluation_date: daysAgo(7),
        vo2_max: 57.8,
        max_speed_kmh: 33.5,
        strength_pct: 78,
        endurance_pct: 85,
        flexibility_pct: 83,
        agility_score: 92,
        reaction_time_ms: 172,
        overall_score_pct: 86,
        trend: 'stable',
        comparison_previous_pct: 1,
        physical_readiness_pct: 89,
        mental_readiness_pct: 92,
        notes: 'Consistent performer with elite agility scores. Upper body strength could improve.',
        recommendations: 'Introduce upper body strength block into weekly programme.',
        created_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 12,        // Declan Rice
        evaluator_id: 4,
        evaluation_date: daysAgo(7),
        vo2_max: 59.3,
        max_speed_kmh: 31.4,
        strength_pct: 89,
        endurance_pct: 92,
        flexibility_pct: 72,
        agility_score: 85,
        reaction_time_ms: 188,
        overall_score_pct: 88,
        trend: 'up',
        comparison_previous_pct: 2,
        physical_readiness_pct: 93,
        mental_readiness_pct: 91,
        notes: 'Exceptional work-rate and endurance. Highest distance covered in last 3 matches.',
        recommendations: 'Increase dedicated flexibility sessions to reduce injury risk.',
        created_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 4,         // Trent Alexander-Arnold
        evaluator_id: 4,
        evaluation_date: daysAgo(7),
        vo2_max: 56.7,
        max_speed_kmh: 33.1,
        strength_pct: 80,
        endurance_pct: 86,
        flexibility_pct: 78,
        agility_score: 87,
        reaction_time_ms: 182,
        overall_score_pct: 84,
        trend: 'stable',
        comparison_previous_pct: 0,
        physical_readiness_pct: 87,
        mental_readiness_pct: 89,
        notes: 'Consistently high performance levels. Fully recovered from previous thigh strain.',
        recommendations: 'Maintain current programme with additional speed endurance work.',
        created_at: new Date(),
      },
      {
        club_id: 1,
        player_id: 16,        // Jack Grealish
        evaluator_id: 4,
        evaluation_date: daysAgo(7),
        vo2_max: 55.9,
        max_speed_kmh: 30.8,
        strength_pct: 77,
        endurance_pct: 83,
        flexibility_pct: 86,
        agility_score: 89,
        reaction_time_ms: 176,
        overall_score_pct: 82,
        trend: 'down',
        comparison_previous_pct: -2,
        physical_readiness_pct: 84,
        mental_readiness_pct: 88,
        notes: 'Minor dip in explosive power metrics. Well rested after mid-week break.',
        recommendations: 'Review training intensity. Add power and plyometric sessions.',
        created_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('performances', performances);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('performances', { club_id: 1 });
  },
};
