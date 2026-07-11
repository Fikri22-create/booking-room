const Amenity = require('../models/Amenity')
const RoomAmenity = require('../models/RoomAmenity')
const Room = require('../models/Room')

exports.getAllAmenities = async (req, res, next) => {
    try {
        const amenities = await Amenity.findAll({
            order: [['category', 'ASC'], ['name', 'ASC']]
        })
        return res.status(200).json({
            success: true,
            data: amenities
        })
    } catch (error) {
        next(error)
    }
}

exports.getAmenityById = async (req, res, next) => {
    try {
        const amenity = await Amenity.findByPk(req.params.id)
        if (!amenity) {
            return res.status(404).json({
                success: false,
                message: 'Amenity not found'
            })
        }
        return res.status(200).json({
            success: true,
            data: amenity
        })
    } catch (error) {
        next(error)
    }
}

exports.createAmenity = async (req, res, next) => {
    try {
        const { name, description, icon, category } = req.body
        const amenity = await Amenity.create({ name, description, icon, category })
        return res.status(201).json({
            success: true,
            data: amenity,
            message: 'Amenity created successfully'
        })
    } catch (error) {
        next(error)
    }
}

exports.updateAmenity = async (req, res, next) => {
    try {
        const amenity = await Amenity.findByPk(req.params.id)
        if (!amenity) {
            return res.status(404).json({
                success: false,
                message: 'Amenity not found'
            })
        }
        const { name, description, icon, category } = req.body
        await amenity.update({ name, description, icon, category })
        return res.status(200).json({
            success: true,
            data: amenity,
            message: 'Amenity updated successfully'
        })
    } catch (error) {
        next(error)
    }
}

exports.deleteAmenity = async (req, res, next) => {
    try {
        const amenity = await Amenity.findByPk(req.params.id)
        if (!amenity) {
            return res.status(404).json({
                success: false,
                message: 'Amenity not found'
            })
        }
        await amenity.destroy()
        return res.status(200).json({
            success: true,
            message: 'Amenity deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}

exports.restoreAmenity = async (req, res, next) => {
    try {
        const amenity = await Amenity.findByPk(req.params.id, { paranoid: false })
        if (!amenity) {
            return res.status(404).json({
                success: false,
                message: 'Amenity not found'
            })
        }
        if (!amenity.deletedAt) {
            return res.status(400).json({
                success: false,
                message: 'Amenity is not deleted'
            })
        }
        await amenity.restore()
        return res.status(200).json({
            success: true,
            data: amenity,
            message: 'Amenity restored successfully'
        })
    } catch (error) {
        next(error)
    }
}

exports.permanentDeleteAmenity = async (req, res, next) => {
    try {
        const amenity = await Amenity.findByPk(req.params.id, { paranoid: false })
        if (!amenity) {
            return res.status(404).json({
                success: false,
                message: 'Amenity not found'
            })
        }
        await amenity.destroy({ force: true })
        return res.status(200).json({
            success: true,
            message: 'Amenity permanently deleted'
        })
    } catch (error) {
        next(error)
    }
}

exports.assignAmenityToRoom = async (req, res, next) => {
    try {
        const { roomId, amenityIds } = req.body
        const room = await Room.findByPk(roomId)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }
        await RoomAmenity.destroy({ where: { roomId } })
        const roomAmenities = amenityIds.map(amenityId => ({
            roomId,
            amenityId
        }))
        await RoomAmenity.bulkCreate(roomAmenities)
        return res.status(200).json({
            success: true,
            message: 'Amenities assigned to room successfully'
        })
    } catch (error) {
        next(error)
    }
}

exports.getRoomAmenities = async (req, res, next) => {
    try {
        const { roomId } = req.params
        const room = await Room.findByPk(roomId, {
            include: [{
                model: Amenity,
                as: 'amenities',
                through: { attributes: [] }
            }]
        })
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }
        return res.status(200).json({
            success: true,
            data: room.amenities
        })
    } catch (error) {
        next(error)
    }
}
