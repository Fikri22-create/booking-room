const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Room = require('./Room')
const Amenity = require('./Amenity')

const RoomAmenity = sequelize.define('room_amenities', {
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
    amenityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'amenities',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
})

Room.belongsToMany(Amenity, { through: RoomAmenity, foreignKey: 'roomId', as: 'amenities' })
Amenity.belongsToMany(Room, { through: RoomAmenity, foreignKey: 'amenityId', as: 'rooms' })

module.exports = RoomAmenity
