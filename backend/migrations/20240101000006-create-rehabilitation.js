'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rehabilitation_programs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      injury_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'injuries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      program_name: { type: Sequelize.STRING(200), allowNull: false },
      phase: { type: Sequelize.INTEGER, defaultValue: 1 },
      phase_label: { type: Sequelize.STRING(100), allowNull: true },
      progress_pct: { type: Sequelize.FLOAT, defaultValue: 0 },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      expected_end_date: { type: Sequelize.DATEONLY, allowNull: true },
      actual_end_date: { type: Sequelize.DATEONLY, allowNull: true },
      therapist_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      status: { type: Sequelize.ENUM('active','completed','paused','cancelled'), defaultValue: 'active' },
      goals: { type: Sequelize.TEXT, allowNull: true },
      exercises_description: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('rehabilitation_programs', ['club_id']);
    await queryInterface.addIndex('rehabilitation_programs', ['player_id']);
    await queryInterface.addIndex('rehabilitation_programs', ['status']);

    await queryInterface.createTable('rehab_sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      program_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'rehabilitation_programs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      therapist_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      session_date: { type: Sequelize.DATEONLY, allowNull: false },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: true },
      session_type: { type: Sequelize.STRING(100), allowNull: true },
      exercises_done: { type: Sequelize.TEXT, allowNull: true },
      pain_level: { type: Sequelize.INTEGER, allowNull: true },
      progress_notes: { type: Sequelize.TEXT, allowNull: true },
      attendance: { type: Sequelize.ENUM('attended','missed','cancelled'), defaultValue: 'attended' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('rehab_sessions', ['program_id']);
    await queryInterface.addIndex('rehab_sessions', ['player_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rehab_sessions');
    await queryInterface.dropTable('rehabilitation_programs');
  },
};
