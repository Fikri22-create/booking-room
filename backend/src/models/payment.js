const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Booking = require('./Booking')

const Payment = sequelize.define('payments', {
    payment_method: {
        type: DataTypes.ENUM(
            'bank_transfer',
            'credit_card',
            'e_wallet'
        ),
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(
            'pending',
            'paid',
            'failed',
            'refunded'
        ),
        defaultValue: 'pending'
    },
    proof_image: {
        type: DataTypes.STRING
    },
    payment_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
}, {
    paranoid: true
})

Booking.hasOne(Payment)
Payment.belongsTo(Booking)

module.exports = Payment