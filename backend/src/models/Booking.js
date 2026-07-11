const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Room = require('./Room')

const Booking = sequelize.define('bookings', {
    check_in: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    check_out: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    guest_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    total_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    special_request: {
        type: DataTypes.TEXT
    },
    booking_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    paranoid: true
})

User.hasMany(Booking)
Booking.belongsTo(User)

Room.hasMany(Booking)
Booking.belongsTo(Room)

module.exports = Booking