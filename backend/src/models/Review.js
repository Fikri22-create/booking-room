const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Room = require('./Room')

const Review = sequelize.define('reviews', {
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rooms',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isHidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    paranoid: true
})

Room.hasMany(Review, { foreignKey: 'roomId', as: 'reviews' })
Review.belongsTo(Room, { foreignKey: 'roomId', as: 'room' })

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' })
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' })

module.exports = Review
