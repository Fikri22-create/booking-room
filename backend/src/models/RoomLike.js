const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')
const Room = require('./Room')

const RoomLike = sequelize.define('room_likes', {
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
    is_like: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    paranoid: true
})

Room.hasMany(RoomLike, { foreignKey: 'roomId', as: 'roomLikes' })
RoomLike.belongsTo(Room, { foreignKey: 'roomId', as: 'room' })

User.hasMany(RoomLike, { foreignKey: 'userId', as: 'roomLikes' })
RoomLike.belongsTo(User, { foreignKey: 'userId', as: 'user' })

module.exports = RoomLike
