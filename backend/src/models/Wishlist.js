const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Room = require('./Room')

const Wishlist = sequelize.define('wishlists', {
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
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rooms',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
})

User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlists' })
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Room.hasMany(Wishlist, { foreignKey: 'roomId', as: 'wishlists' })
Wishlist.belongsTo(Room, { foreignKey: 'roomId', as: 'room' })

module.exports = Wishlist
