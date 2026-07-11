const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Room = sequelize.define('rooms', {
    room_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    room_type: {
        type: DataTypes.ENUM('standard', 'deluxe', 'suite'),
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price_per_night: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('available', 'maintenance'),
        defaultValue: 'available'
    }
}, {
    paranoid: true
})

module.exports = Room