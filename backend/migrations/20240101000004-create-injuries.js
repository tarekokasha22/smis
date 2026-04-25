'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('injuries', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      injury_type: { type: Sequelize.STRING(100), allowNull: false },
      body_area: { type: Sequelize.STRING(100), allowNull: false },
      body_side: { type: Sequelize.ENUM('left','right','both'), allowNull: true },
      severity: { type: Sequelize.ENUM('mild','moderate','severe','critical'), allowNull: false },
      expected_recovery_days: { type: Sequelize.INTEGER, allowNull: false },
      actual_recovery_days: { type: Sequelize.INTEGER, allowNull: true },
      injury_date: { type: Sequelize.DATEONLY, allowNull: false },
      return_date: { type: Sequelize.DATEONLY, allowNull: true },
      treating_doctor_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      mechanism: { type: Sequelize.ENUM('collision','overuse','fatigue','unknown'), allowNull: true },
      occurred_during: { type: Sequelize.ENUM('match','training','other'), allowNull: true },
      is_recurring: { type: Sequelize.BOOLEAN, defaultValue: false },
      recurrence_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      description: { type: Sequelize.TEXT, allowNull: true },
      treatment_plan: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('active','recovering','closed'), defaultValue: 'active' },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('injuries', ['club_id']);
    await queryInterface.addIndex('injuries', ['player_id']);
    await queryInterface.addIndex('injuries', ['status']);
    await queryInterface.addIndex('injuries', ['severity']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('injuries');
  },
};
