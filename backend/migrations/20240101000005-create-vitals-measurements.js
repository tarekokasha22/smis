'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // المؤشرات الحيوية
    await queryInterface.createTable('vitals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      recorded_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      recorded_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      heart_rate: { type: Sequelize.INTEGER, allowNull: true },
      blood_pressure_systolic: { type: Sequelize.INTEGER, allowNull: true },
      blood_pressure_diastolic: { type: Sequelize.INTEGER, allowNull: true },
      temperature: { type: Sequelize.FLOAT, allowNull: true },
      spo2: { type: Sequelize.FLOAT, allowNull: true },
      weight: { type: Sequelize.FLOAT, allowNull: true },
      height: { type: Sequelize.FLOAT, allowNull: true },
      bmi: { type: Sequelize.FLOAT, allowNull: true },
      resting_hr: { type: Sequelize.INTEGER, allowNull: true },
      hrv: { type: Sequelize.FLOAT, allowNull: true },
      sleep_hours: { type: Sequelize.FLOAT, allowNull: true },
      fatigue_level: { type: Sequelize.INTEGER, allowNull: true },
      hydration_status: { type: Sequelize.STRING(50), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('vitals', ['club_id']);
    await queryInterface.addIndex('vitals', ['player_id']);

    // قياسات الجسم
    await queryInterface.createTable('body_measurements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clubs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      recorded_by: { type: Sequelize.INTEGER, allowNull: true },
      measured_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      weight: { type: Sequelize.FLOAT, allowNull: true },
      body_fat_pct: { type: Sequelize.FLOAT, allowNull: true },
      muscle_mass_kg: { type: Sequelize.FLOAT, allowNull: true },
      bone_mass_kg: { type: Sequelize.FLOAT, allowNull: true },
      water_pct: { type: Sequelize.FLOAT, allowNull: true },
      chest_cm: { type: Sequelize.FLOAT, allowNull: true },
      waist_cm: { type: Sequelize.FLOAT, allowNull: true },
      hip_cm: { type: Sequelize.FLOAT, allowNull: true },
      thigh_cm: { type: Sequelize.FLOAT, allowNull: true },
      calf_cm: { type: Sequelize.FLOAT, allowNull: true },
      arm_cm: { type: Sequelize.FLOAT, allowNull: true },
      neck_cm: { type: Sequelize.FLOAT, allowNull: true },
      inbody_score: { type: Sequelize.FLOAT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('body_measurements', ['club_id']);
    await queryInterface.addIndex('body_measurements', ['player_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('body_measurements');
    await queryInterface.dropTable('vitals');
  },
};
