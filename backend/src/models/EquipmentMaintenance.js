const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EquipmentMaintenance = sequelize.define('EquipmentMaintenance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    equipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maintenance_type: {
      type: DataTypes.ENUM('routine', 'repair', 'calibration', 'inspection'),
      allowNull: false,
    },
    performed_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    next_due: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'completed',
    },
  }, {
    tableName: 'equipment_maintenance',
    updatedAt: false,
  });

  return EquipmentMaintenance;
};
