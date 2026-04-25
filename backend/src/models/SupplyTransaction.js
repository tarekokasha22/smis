const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SupplyTransaction = sequelize.define('SupplyTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    supply_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    transaction_type: {
      type: DataTypes.ENUM('dispense', 'restock', 'adjustment', 'expired_disposal'),
      allowNull: false,
    },
    quantity_change: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining_after: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transaction_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'supply_transactions',
    updatedAt: false,
  });

  return SupplyTransaction;
};
