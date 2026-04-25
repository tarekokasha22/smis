const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Injury = sequelize.define('Injury', {
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
    injury_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    body_area: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    body_side: {
      type: DataTypes.ENUM('left', 'right', 'both'),
      allowNull: true,
    },
    severity: {
      type: DataTypes.ENUM('mild', 'moderate', 'severe', 'critical'),
      allowNull: false,
    },
    expected_recovery_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    actual_recovery_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    injury_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    treating_doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mechanism: {
      type: DataTypes.ENUM('collision', 'overuse', 'fatigue', 'unknown'),
      allowNull: true,
    },
    occurred_during: {
      type: DataTypes.ENUM('match', 'training', 'other'),
      allowNull: true,
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurrence_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    treatment_plan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'recovering', 'closed'),
      defaultValue: 'active',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'injuries',
  });

  return Injury;
};
