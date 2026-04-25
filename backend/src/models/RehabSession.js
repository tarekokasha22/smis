const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RehabSession = sequelize.define('RehabSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    therapist_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    session_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    session_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    exercises_done: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pain_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0, max: 10 },
    },
    progress_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attendance: {
      type: DataTypes.ENUM('attended', 'missed', 'cancelled'),
      defaultValue: 'attended',
    },
  }, {
    tableName: 'rehab_sessions',
    updatedAt: false,
  });

  return RehabSession;
};
