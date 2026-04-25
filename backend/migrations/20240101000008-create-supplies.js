'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('supplies', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(150), allowNull: false },
      category: { type: Sequelize.ENUM('medication','topical','supplement','consumable','equipment_consumable'), allowNull: false },
      unit: { type: Sequelize.STRING(50), allowNull: true },
      total_quantity: { type: Sequelize.INTEGER, defaultValue: 0 },
      used_quantity: { type: Sequelize.INTEGER, defaultValue: 0 },
      reorder_level: { type: Sequelize.INTEGER, defaultValue: 10 },
      expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
      storage_location: { type: Sequelize.STRING(150), allowNull: true },
      purpose: { type: Sequelize.STRING(200), allowNull: true },
      manufacturer: { type: Sequelize.STRING(100), allowNull: true },
      barcode: { type: Sequelize.STRING(100), allowNull: true },
      is_controlled_substance: { type: Sequelize.BOOLEAN, defaultValue: false },
      requires_prescription: { type: Sequelize.BOOLEAN, defaultValue: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('supplies', ['club_id']);
    await queryInterface.addIndex('supplies', ['category']);

    await queryInterface.createTable('supply_transactions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      supply_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'supplies', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      transaction_type: { type: Sequelize.ENUM('dispense','restock','adjustment','expired_disposal'), allowNull: false },
      quantity_change: { type: Sequelize.INTEGER, allowNull: false },
      remaining_after: { type: Sequelize.INTEGER, allowNull: true },
      performed_by: { type: Sequelize.INTEGER, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      transaction_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('supply_transactions', ['supply_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('supply_transactions');
    await queryInterface.dropTable('supplies');
  },
};
