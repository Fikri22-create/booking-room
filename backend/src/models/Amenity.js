const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Amenity = sequelize.define('amenities', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('basic', 'entertainment', 'bathroom', 'comfort', 'safety', 'food'),
        defaultValue: 'basic'
    }
}, {
    paranoid: true
})

module.exports = Amenity
