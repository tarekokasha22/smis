const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Supply = sequelize.define('Supply', {
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
    category: {
      type: DataTypes.ENUM('medication', 'topical', 'supplement', 'consumable', 'equipment_consumable'),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    used_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reorder_level: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
    storage_location: { type: DataTypes.STRING(150), allowNull: true },
    purpose: { type: DataTypes.STRING(200), allowNull: true },
    manufacturer: { type: DataTypes.STRING(100), allowNull: true },
    barcode: { type: DataTypes.STRING(100), allowNull: true },
    is_controlled_substance: { type: DataTypes.BOOLEAN, defaultValue: false },
    requires_prescription: { type: DataTypes.BOOLEAN, defaultValue: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'supplies',
  });

  return Supply;
};
