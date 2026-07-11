"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const standardDesc = "A cozy and elegant room designed for business or leisure travelers. Features a comfortable queen-size bed, a work desk, high-speed Wi-Fi, air conditioning, a flat-screen smart TV, and a clean modern bathroom with essential amenities.";
    const deluxeDesc = "A spacious and beautifully appointed room offering elevated comfort. Equipped with a king-size bed or twin beds, a private seating area, high-speed Wi-Fi, a minibar, flat-screen smart TV, and a luxurious bathroom with a walk-in rain shower and premium toiletries. Perfect for couples or families.";
    const suiteDesc = "The ultimate luxury experience. This expansive suite features a separate living area, a plush master bedroom with a king-size bed, and a private balcony with panoramic views. High-speed Wi-Fi, a fully stocked minibar, multiple smart TVs, and a spa-like bathroom with a deep soaking tub and premium bath products are provided. Ideal for premium guests seeking unparalleled comfort and space.";

    await queryInterface.sequelize.query(
      `UPDATE rooms SET description = :desc WHERE room_type = 'standard'`,
      { replacements: { desc: standardDesc } }
    );
    await queryInterface.sequelize.query(
      `UPDATE rooms SET description = :desc WHERE room_type = 'deluxe'`,
      { replacements: { desc: deluxeDesc } }
    );
    await queryInterface.sequelize.query(
      `UPDATE rooms SET description = :desc WHERE room_type = 'suite'`,
      { replacements: { desc: suiteDesc } }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE rooms SET description = CONCAT(UPPER(SUBSTRING(room_type,1,1)), SUBSTRING(room_type,2), ' Room ', room_number)`
    );
  }
};
