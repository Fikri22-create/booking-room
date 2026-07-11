"use strict";

module.exports = {
  async up(queryInterface) {
    const standardDesc = "A cozy and elegant room designed for business or leisure travelers. Features a comfortable queen-size bed, a work desk, high-speed Wi-Fi, air conditioning, a flat-screen smart TV, and a clean modern bathroom with essential amenities.";
    const deluxeDesc = "A spacious and beautifully appointed room offering elevated comfort. Equipped with a king-size bed or twin beds, a private seating area, high-speed Wi-Fi, a minibar, flat-screen smart TV, and a luxurious bathroom with a walk-in rain shower and premium toiletries. Perfect for couples or families.";
    const suiteDesc = "The ultimate luxury experience. This expansive suite features a separate living area, a plush master bedroom with a king-size bed, and a private balcony with panoramic views. High-speed Wi-Fi, a fully stocked minibar, multiple smart TVs, and a spa-like bathroom with a deep soaking tub and premium bath products are provided. Ideal for premium guests seeking unparalleled comfort and space.";

    const roomsToInsert = [
      {
        room_number: "101",
        room_type: "standard",
        capacity: 2,
        price_per_night: 300000,
        description: standardDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        room_number: "102",
        room_type: "standard",
        capacity: 2,
        price_per_night: 300000,
        description: standardDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        room_number: "103",
        room_type: "standard",
        capacity: 2,
        price_per_night: 300000,
        description: standardDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        room_number: "201",
        room_type: "deluxe",
        capacity: 4,
        price_per_night: 600000,
        description: deluxeDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        room_number: "202",
        room_type: "deluxe",
        capacity: 4,
        price_per_night: 650000,
        description: deluxeDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        room_number: "203",
        room_type: "deluxe",
        capacity: 4,
        price_per_night: 700000,
        description: deluxeDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        room_number: "301",
        room_type: "suite",
        capacity: 6,
        price_per_night: 1200000,
        description: suiteDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        room_number: "302",
        room_type: "suite",
        capacity: 6,
        price_per_night: 1400000,
        description: suiteDesc,
        image: null,
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const [existing] = await queryInterface.sequelize.query(
      `SELECT room_number FROM rooms`
    );
    const existingNumbers = existing.map(r => r.room_number);
    const filtered = roomsToInsert.filter(r => !existingNumbers.includes(r.room_number));

    if (filtered.length > 0) {
      await queryInterface.bulkInsert("rooms", filtered);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("rooms", null, {});
  }
};