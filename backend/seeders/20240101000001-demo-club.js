'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('clubs', [{
      id: 1,
      name: 'Elite FC',
      name_en: 'Elite FC',
      logo_url: null,
      primary_color: '#1D9E75',
      sport_type: 'Football',
      city: 'London',
      country: 'England',
      subscription_plan: 'premium',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('clubs', { id: 1 });
  },
};
