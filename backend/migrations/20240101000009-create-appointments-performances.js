'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      doctor_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      appointment_type: { type: Sequelize.STRING(100), allowNull: true },
      location: { type: Sequelize.STRING(150), allowNull: true },
      scheduled_date: { type: Sequelize.DATEONLY, allowNull: false },
      scheduled_time: { type: Sequelize.TIME, allowNull: true },
      duration_minutes: { type: Sequelize.INTEGER, defaultValue: 30 },
      status: { type: Sequelize.ENUM('scheduled','completed','cancelled','no_show','rescheduled'), defaultValue: 'scheduled' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      reminder_sent: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('appointments', ['club_id']);
    await queryInterface.addIndex('appointments', ['player_id']);
    await queryInterface.addIndex('appointments', ['scheduled_date']);

    await queryInterface.createTable('performances', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      evaluator_id: { type: Sequelize.INTEGER, allowNull: true },
      evaluation_date: { type: Sequelize.DATEONLY, allowNull: false },
      vo2_max: { type: Sequelize.FLOAT, allowNull: true },
      max_speed_kmh: { type: Sequelize.FLOAT, allowNull: true },
      strength_pct: { type: Sequelize.FLOAT, allowNull: true },
      endurance_pct: { type: Sequelize.FLOAT, allowNull: true },
      flexibility_pct: { type: Sequelize.FLOAT, allowNull: true },
      agility_score: { type: Sequelize.FLOAT, allowNull: true },
      reaction_time_ms: { type: Sequelize.FLOAT, allowNull: true },
      overall_score_pct: { type: Sequelize.FLOAT, allowNull: true },
      trend: { type: Sequelize.ENUM('up','stable','down'), allowNull: true },
      comparison_previous_pct: { type: Sequelize.FLOAT, allowNull: true },
      physical_readiness_pct: { type: Sequelize.FLOAT, allowNull: true },
      mental_readiness_pct: { type: Sequelize.FLOAT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      recommendations: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('performances', ['club_id']);
    await queryInterface.addIndex('performances', ['player_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('performances');
    await queryInterface.dropTable('appointments');
  },
};
