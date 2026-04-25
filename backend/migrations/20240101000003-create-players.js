'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(100), allowNull: false },
      number: { type: Sequelize.INTEGER, allowNull: false },
      position: { type: Sequelize.STRING(50), allowNull: false },
      status: { type: Sequelize.ENUM('ready','injured','rehab','suspended','unknown'), defaultValue: 'ready' },
      nationality: { type: Sequelize.STRING(50), allowNull: true },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
      height: { type: Sequelize.FLOAT, allowNull: true },
      weight: { type: Sequelize.FLOAT, allowNull: true },
      blood_type: { type: Sequelize.STRING(5), allowNull: true },
      dominant_foot: { type: Sequelize.ENUM('right','left','both'), allowNull: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      emergency_contact_name: { type: Sequelize.STRING(100), allowNull: true },
      emergency_contact_phone: { type: Sequelize.STRING(20), allowNull: true },
      chronic_conditions: { type: Sequelize.TEXT, allowNull: true },
      surgeries_history: { type: Sequelize.TEXT, allowNull: true },
      previous_injuries: { type: Sequelize.TEXT, allowNull: true },
      current_medications: { type: Sequelize.TEXT, allowNull: true },
      contract_start: { type: Sequelize.DATEONLY, allowNull: true },
      contract_end: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('players', ['club_id']);
    await queryInterface.addIndex('players', ['status']);
    await queryInterface.addIndex('players', ['club_id', 'number']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('players');
  },
};
