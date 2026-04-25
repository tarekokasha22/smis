const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Equipment = sequelize.define('Equipment', {
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
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('excellent', 'good', 'needs_maintenance', 'out_of_service'),
      defaultValue: 'good',
    },
    purchase_date: { type: DataTypes.DATEONLY, allowNull: true },
    purchase_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    warranty_expiry: { type: DataTypes.DATEONLY, allowNull: true },
    last_maintenance_date: { type: DataTypes.DATEONLY, allowNull: true },
    next_maintenance_date: { type: DataTypes.DATEONLY, allowNull: true },
    requires_calibration: { type: DataTypes.BOOLEAN, defaultValue: false },
    calibration_date: { type: DataTypes.DATEONLY, allowNull: true },
    usage_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    notes: { type: DataTypes.TEXT, allowNull: true },
    image_url: { type: DataTypes.STRING(500), allowNull: true },
  }, {
    tableName: 'equipment',
  });

  return Equipment;
};
