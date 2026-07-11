"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const usersToInsert = [
      {
        name: "Muhammad Fikri Alfarizi",
        email: "fikriamuhammad93@gmail.com",
        password: await bcrypt.hash("kyygaming22__*", 10),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Fikri",
        email: "user2@gmail.com",
        password: await bcrypt.hash("user2well", 10),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Alfarizi",
        email: "user3@gmail.com",
        password: await bcrypt.hash("user3well", 10),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Rizky",
        email: "user4@gmail.com",
        password: await bcrypt.hash("user4well", 10),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Rafa",
        email: "user5@gmail.com",
        password: await bcrypt.hash("user5well", 10),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const [existing] = await queryInterface.sequelize.query(
      `SELECT email FROM users WHERE role = 'user'`
    );
    const existingEmails = existing.map(u => u.email);
    const filtered = usersToInsert.filter(u => !existingEmails.includes(u.email));

    if (filtered.length > 0) {
      await queryInterface.bulkInsert("users", filtered);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      role: "user"
    });
  }
};