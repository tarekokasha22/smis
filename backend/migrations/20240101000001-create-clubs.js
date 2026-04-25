'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clubs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      name_en: { type: Sequelize.STRING(100), allowNull: true },
      logo_url: { type: Sequelize.STRING(500), allowNull: true },
      primary_color: { type: Sequelize.STRING(7), defaultValue: '#1D9E75' },
      sport_type: { type: Sequelize.STRING(50), defaultValue: 'كرة قدم' },
      city: { type: Sequelize.STRING(100), allowNull: true },
      country: { type: Sequelize.STRING(100), defaultValue: 'السعودية' },
      subscription_plan: { type: Sequelize.STRING(50), defaultValue: 'basic' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('clubs');
  },
};
