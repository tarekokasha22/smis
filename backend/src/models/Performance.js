const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Performance = sequelize.define('Performance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    evaluator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    evaluation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    vo2_max: { type: DataTypes.FLOAT, allowNull: true },
    max_speed_kmh: { type: DataTypes.FLOAT, allowNull: true },
    strength_pct: { type: DataTypes.FLOAT, allowNull: true },
    endurance_pct: { type: DataTypes.FLOAT, allowNull: true },
    flexibility_pct: { type: DataTypes.FLOAT, allowNull: true },
    agility_score: { type: DataTypes.FLOAT, allowNull: true },
    reaction_time_ms: { type: DataTypes.FLOAT, allowNull: true },
    overall_score_pct: { type: DataTypes.FLOAT, allowNull: true },
    trend: {
      type: DataTypes.ENUM('up', 'stable', 'down'),
      allowNull: true,
    },
    comparison_previous_pct: { type: DataTypes.FLOAT, allowNull: true },
    physical_readiness_pct: { type: DataTypes.FLOAT, allowNull: true },
    mental_readiness_pct: { type: DataTypes.FLOAT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    recommendations: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'performances',
    updatedAt: false,
  });

  return Performance;
};
