"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@gmail.com' LIMIT 1`
    );
    if (existing.length > 0) return;

    await queryInterface.bulkInsert("users", [
      {
        name: "Administrator",
        email: "admin@gmail.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: "admin@gmail.com"
    });
  }
};