'use strict';

module.exports = {
  async up(queryInterface) {
    const players = [
      // Goalkeepers
      { club_id: 1, name: 'Jordan Pickford',        number: 1,  position: 'Goalkeeper', status: 'ready',     nationality: 'English', height: 185, weight: 73, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Nick Pope',               number: 23, position: 'Goalkeeper', status: 'ready',     nationality: 'English', height: 196, weight: 88, blood_type: 'A+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Aaron Ramsdale',          number: 35, position: 'Goalkeeper', status: 'ready',     nationality: 'English', height: 190, weight: 83, blood_type: 'B+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },

      // Defenders
      { club_id: 1, name: 'Trent Alexander-Arnold', number: 66, position: 'Right Back',   status: 'ready',     nationality: 'English', height: 180, weight: 79, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Kyle Walker',             number: 2,  position: 'Right Back',   status: 'ready',     nationality: 'English', height: 182, weight: 78, blood_type: 'A+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'John Stones',             number: 5,  position: 'Centre Back',  status: 'injured',   nationality: 'English', height: 188, weight: 82, blood_type: 'B+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Harry Maguire',           number: 15, position: 'Centre Back',  status: 'ready',     nationality: 'English', height: 194, weight: 100, blood_type: 'O+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Luke Shaw',               number: 33, position: 'Left Back',    status: 'suspended', nationality: 'English', height: 178, weight: 75, blood_type: 'A+',  dominant_foot: 'left',  is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Ben White',               number: 4,  position: 'Centre Back',  status: 'ready',     nationality: 'English', height: 183, weight: 80, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Reece James',             number: 24, position: 'Right Back',   status: 'injured',   nationality: 'English', height: 180, weight: 79, blood_type: 'AB+', dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Marc Guehi',              number: 6,  position: 'Centre Back',  status: 'ready',     nationality: 'English', height: 182, weight: 80, blood_type: 'B+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },

      // Midfielders
      { club_id: 1, name: 'Declan Rice',             number: 41, position: 'Defensive Mid', status: 'ready',     nationality: 'English', height: 185, weight: 82, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Kalvin Phillips',         number: 14, position: 'Defensive Mid', status: 'ready',     nationality: 'English', height: 183, weight: 77, blood_type: 'A+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Jude Bellingham',         number: 22, position: 'Central Mid',   status: 'ready',     nationality: 'English', height: 186, weight: 81, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Phil Foden',              number: 47, position: 'Attacking Mid',  status: 'ready',     nationality: 'English', height: 171, weight: 73, blood_type: 'A+',  dominant_foot: 'left',  is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Jack Grealish',           number: 10, position: 'Attacking Mid',  status: 'ready',     nationality: 'English', height: 180, weight: 76, blood_type: 'B+',  dominant_foot: 'left',  is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Mason Mount',             number: 19, position: 'Central Mid',    status: 'ready',     nationality: 'English', height: 181, weight: 71, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },

      // Forwards
      { club_id: 1, name: 'Bukayo Saka',             number: 7,  position: 'Forward',   status: 'ready',     nationality: 'English', height: 178, weight: 76, blood_type: 'A+',  dominant_foot: 'left',  is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Harry Kane',              number: 9,  position: 'Striker',   status: 'ready',     nationality: 'English', height: 188, weight: 89, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Marcus Rashford',         number: 11, position: 'Forward',   status: 'suspended', nationality: 'English', height: 185, weight: 70, blood_type: 'B+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Ollie Watkins',           number: 17, position: 'Striker',   status: 'ready',     nationality: 'English', height: 181, weight: 74, blood_type: 'O+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
      { club_id: 1, name: 'Ivan Toney',              number: 18, position: 'Striker',   status: 'ready',     nationality: 'English', height: 183, weight: 80, blood_type: 'A+',  dominant_foot: 'right', is_active: true, created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('players', players);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('players', { club_id: 1 });
  },
};
