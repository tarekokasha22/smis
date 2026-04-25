const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vital = sequelize.define('Vital', {
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
    recorded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    recorded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    heart_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    blood_pressure_systolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    blood_pressure_diastolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    spo2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    bmi: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    resting_hr: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hrv: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sleep_hours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    fatigue_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 10 },
    },
    hydration_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'vitals',
    updatedAt: false,
  });

  return Vital;
};
