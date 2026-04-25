'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipment', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(150), allowNull: false },
      purpose: { type: Sequelize.STRING(200), allowNull: true },
      brand: { type: Sequelize.STRING(100), allowNull: true },
      serial_number: { type: Sequelize.STRING(100), allowNull: true },
      model: { type: Sequelize.STRING(100), allowNull: true },
      location: { type: Sequelize.STRING(150), allowNull: true },
      status: { type: Sequelize.ENUM('excellent','good','needs_maintenance','out_of_service'), defaultValue: 'good' },
      purchase_date: { type: Sequelize.DATEONLY, allowNull: true },
      purchase_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      warranty_expiry: { type: Sequelize.DATEONLY, allowNull: true },
      last_maintenance_date: { type: Sequelize.DATEONLY, allowNull: true },
      next_maintenance_date: { type: Sequelize.DATEONLY, allowNull: true },
      requires_calibration: { type: Sequelize.BOOLEAN, defaultValue: false },
      calibration_date: { type: Sequelize.DATEONLY, allowNull: true },
      usage_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('equipment', ['club_id']);
    await queryInterface.addIndex('equipment', ['status']);

    await queryInterface.createTable('equipment_maintenance', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      equipment_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'equipment', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      performed_by: { type: Sequelize.INTEGER, allowNull: true },
      maintenance_type: { type: Sequelize.ENUM('routine','repair','calibration','inspection'), allowNull: false },
      performed_at: { type: Sequelize.DATE, allowNull: false },
      cost: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      next_due: { type: Sequelize.DATEONLY, allowNull: true },
      status: { type: Sequelize.STRING(50), defaultValue: 'completed' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('equipment_maintenance', ['equipment_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('equipment_maintenance');
    await queryInterface.dropTable('equipment');
  },
};
