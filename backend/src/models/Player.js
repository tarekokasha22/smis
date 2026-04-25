const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ready', 'injured', 'rehab', 'suspended', 'unknown'),
      defaultValue: 'ready',
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    blood_type: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    dominant_foot: {
      type: DataTypes.ENUM('right', 'left', 'both'),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    emergency_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    chronic_conditions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    surgeries_history: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previous_injuries: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    current_medications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contract_start: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    contract_end: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    custom_fields: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: 'players',
  });

  return Player;
};
