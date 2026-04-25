'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('clubs', [{
      id: 1,
      name: 'نادي الهلال الرياضي',
      name_en: 'Al Hilal FC',
      logo_url: null,
      primary_color: '#1D9E75',
      sport_type: 'كرة قدم',
      city: 'الرياض',
      country: 'السعودية',
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
