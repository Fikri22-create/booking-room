const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Room = require('./Room')

const RoomGallery = sequelize.define('room_galleries', {
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
    image: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    paranoid: true
})

Room.hasMany(RoomGallery, { foreignKey: 'roomId', as: 'gallery' })
RoomGallery.belongsTo(Room, { foreignKey: 'roomId', as: 'room' })

module.exports = RoomGallery
