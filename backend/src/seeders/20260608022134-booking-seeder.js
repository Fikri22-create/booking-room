"use strict";

module.exports = {
  async up(queryInterface) {
    
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 5`
    );

    
    const [rooms] = await queryInterface.sequelize.query(
      `SELECT id FROM rooms ORDER BY id ASC`
    );

    if (users.length < 5 || rooms.length < 7) {
      console.log(`Skipping booking seeder: need 5 users (found ${users.length}) and 7 rooms (found ${rooms.length})`);
      return;
    }

    const bookingsToInsert = [
      {
        booking_code: "HTL-20260608-0001",
        userId: users[0].id,
        roomId: rooms[0].id,
        check_in: "2026-06-15",
        check_out: "2026-06-17",
        guest_count: 2,
        total_price: 600000,
        special_request: "Late check in",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        booking_code: "HTL-20260608-0002",
        userId: users[1].id,
        roomId: rooms[1].id,
        check_in: "2026-06-20",
        check_out: "2026-06-22",
        guest_count: 2,
        total_price: 600000,
        special_request: null,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        booking_code: "HTL-20260608-0003",
        userId: users[2].id,
        roomId: rooms[3].id,
        check_in: "2026-06-25",
        check_out: "2026-06-28",
        guest_count: 4,
        total_price: 1800000,
        special_request: "Extra bed",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        booking_code: "HTL-20260608-0004",
        userId: users[3].id,
        roomId: rooms[6].id,
        check_in: "2026-07-01",
        check_out: "2026-07-04",
        guest_count: 5,
        total_price: 3600000,
        special_request: "Airport pickup",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        booking_code: "HTL-20260608-0005",
        userId: users[4].id,
        roomId: rooms[4].id,
        check_in: "2026-07-05",
        check_out: "2026-07-08",
        guest_count: 4,
        total_price: 1950000,
        special_request: null,
        status: "rejected",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const [existing] = await queryInterface.sequelize.query(
      `SELECT booking_code FROM bookings`
    );
    const existingCodes = existing.map(b => b.booking_code);
    const filtered = bookingsToInsert.filter(b => !existingCodes.includes(b.booking_code));

    if (filtered.length > 0) {
      await queryInterface.bulkInsert("bookings", filtered);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("bookings", null, {});
  }
};