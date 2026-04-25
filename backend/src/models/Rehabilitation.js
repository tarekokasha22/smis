const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rehabilitation = sequelize.define('Rehabilitation', {
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
    injury_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    program_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    phase: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: { min: 1, max: 4 },
    },
    phase_label: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    progress_pct: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expected_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    actual_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    therapist_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'paused', 'cancelled'),
      defaultValue: 'active',
    },
    goals: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exercises_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'rehabilitation_programs',
  });

  return Rehabilitation;
};
