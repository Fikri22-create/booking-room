"use strict";

module.exports = {
  async up(queryInterface) {
    
    const [bookings] = await queryInterface.sequelize.query(
      `SELECT id FROM bookings ORDER BY id ASC`
    );

    if (bookings.length < 3) {
      console.log(`Skipping payment seeder: need at least 3 bookings (found ${bookings.length})`);
      return;
    }

    const paymentsToInsert = [
      {
        bookingId: bookings[0].id,
        payment_method: "bank_transfer",
        amount: 600000,
        payment_date: new Date(),
        status: "paid",
        proof_image: null,
        payment_code: "PAY-0001",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        bookingId: bookings[2].id,
        payment_method: "e_wallet",
        amount: 1800000,
        payment_date: new Date(),
        status: "paid",
        proof_image: null,
        payment_code: "PAY-0002",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const [existing] = await queryInterface.sequelize.query(
      `SELECT payment_code FROM payments`
    );
    const existingCodes = existing.map(p => p.payment_code);
    const filtered = paymentsToInsert.filter(p => !existingCodes.includes(p.payment_code));

    if (filtered.length > 0) {
      await queryInterface.bulkInsert("payments", filtered);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("payments", null, {});
  }
};