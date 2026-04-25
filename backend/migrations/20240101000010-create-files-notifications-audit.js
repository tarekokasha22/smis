'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('file_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      uploaded_by: { type: Sequelize.INTEGER, allowNull: true },
      file_name: { type: Sequelize.STRING(255), allowNull: false },
      file_type: { type: Sequelize.ENUM('xray','mri','scan','report','contract','lab','other'), defaultValue: 'other' },
      file_size: { type: Sequelize.INTEGER, allowNull: true },
      file_path: { type: Sequelize.STRING(500), allowNull: false },
      mime_type: { type: Sequelize.STRING(100), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      is_confidential: { type: Sequelize.BOOLEAN, defaultValue: false },
      tags: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('file_records', ['club_id']);
    await queryInterface.addIndex('file_records', ['player_id']);

    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.STRING(50), allowNull: false },
      title: { type: Sequelize.STRING(200), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: true },
      related_entity_type: { type: Sequelize.STRING(50), allowNull: true },
      related_entity_id: { type: Sequelize.INTEGER, allowNull: true },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      priority: { type: Sequelize.ENUM('low','medium','high','urgent'), defaultValue: 'medium' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['is_read']);

    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: true },
      user_id: { type: Sequelize.INTEGER, allowNull: true },
      user_name: { type: Sequelize.STRING(100), allowNull: true },
      action: { type: Sequelize.STRING(50), allowNull: false },
      entity_type: { type: Sequelize.STRING(50), allowNull: false },
      entity_id: { type: Sequelize.INTEGER, allowNull: true },
      old_values: { type: Sequelize.JSON, allowNull: true },
      new_values: { type: Sequelize.JSON, allowNull: true },
      ip_address: { type: Sequelize.STRING(45), allowNull: true },
      user_agent: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('audit_logs', ['club_id']);
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['entity_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('file_records');
  },
};
