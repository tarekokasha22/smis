const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Club = sequelize.define('Club', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    primary_color: {
      type: DataTypes.STRING(7),
      defaultValue: '#1D9E75',
    },
    sport_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'كرة قدم',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'السعودية',
    },
    subscription_plan: {
      type: DataTypes.STRING(50),
      defaultValue: 'basic',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'clubs',
  });

  return Club;
};
