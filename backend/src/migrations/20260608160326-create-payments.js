"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "bookings",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      payment_method: {
        type: Sequelize.ENUM(
          "bank_transfer",
          "credit_card",
          "e_wallet"
        ),
        allowNull: false
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      payment_date: {
        type: Sequelize.DATE,
        allowNull: false
      },

      status: {
        type: Sequelize.ENUM(
          "pending",
          "paid",
          "failed",
          "refunded"
        ),
        defaultValue: "pending"
      },

      proof_image: {
        type: Sequelize.STRING
      },

      payment_code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
  }
};