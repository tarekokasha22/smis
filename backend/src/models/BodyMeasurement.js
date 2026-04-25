const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BodyMeasurement = sequelize.define('BodyMeasurement', {
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
    measured_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    weight: { type: DataTypes.FLOAT, allowNull: true },
    body_fat_pct: { type: DataTypes.FLOAT, allowNull: true },
    muscle_mass_kg: { type: DataTypes.FLOAT, allowNull: true },
    bone_mass_kg: { type: DataTypes.FLOAT, allowNull: true },
    water_pct: { type: DataTypes.FLOAT, allowNull: true },
    chest_cm: { type: DataTypes.FLOAT, allowNull: true },
    waist_cm: { type: DataTypes.FLOAT, allowNull: true },
    hip_cm: { type: DataTypes.FLOAT, allowNull: true },
    thigh_cm: { type: DataTypes.FLOAT, allowNull: true },
    calf_cm: { type: DataTypes.FLOAT, allowNull: true },
    arm_cm: { type: DataTypes.FLOAT, allowNull: true },
    neck_cm: { type: DataTypes.FLOAT, allowNull: true },
    inbody_score: { type: DataTypes.FLOAT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'body_measurements',
    updatedAt: false,
  });

  return BodyMeasurement;
};
