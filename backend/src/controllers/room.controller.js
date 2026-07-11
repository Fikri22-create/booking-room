const Room = require('../models/Room')
const Booking = require('../models/Booking')
const RoomGallery = require('../models/RoomGallery')
const Review = require('../models/Review')
const RoomLike = require('../models/RoomLike')
const User = require('../models/User')
const { Op } = require('sequelize')
const fs = require('fs')
const path = require('path')
const ExcelJS = require('exceljs')

exports.createRoom = async (req, res, next) => {
    try {
        const {
            room_number,
            room_type,
            capacity,
            price_per_night,
            description
        } = req.body

        if (
            !room_number ||
            !room_type ||
            !capacity ||
            !price_per_night ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        if (Number(capacity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be greater than 0'
            })
        }

        if (Number(price_per_night) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price per night must be greater than 0'
            })
        }

        const existingRoom = await Room.findOne({
            where:{
                room_number
            }
        })
        if(existingRoom){
            return res.status(400).json({
                success:false,
                message:'Room number already exists'
            })
        }

        const room = await Room.create({
            room_number,
            room_type,
            capacity,
            price_per_night,
            description,
            image: req.file ? req.file.filename : null
        })

        return res.status(201).json({
            success: true,
            data: room
        })
    } catch (error) {
        next(error)
    }
}

exports.getRooms = async (req, res, next) => {
    try {
        const {
            search,
            room_type,
            capacity,
            status,
            page = 1,
            limit = 10
        } = req.query

        const currentPage = Math.max(Number(page), 1)
        const currentLimit = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (currentPage - 1) * currentLimit

        const whereClause = {}
        if (search) {
            whereClause.room_number = {
                [Op.like]: `%${search}%`
            }
        }
        if (room_type) {
            whereClause.room_type = room_type
        }
        if (capacity) {
            whereClause.capacity = {
                [Op.gte]: capacity
            }
        }
        if (status) {
            whereClause.status = status
        }

        const { count, rows } = await Room.findAndCountAll({
            where: whereClause,
            include: [{
                model : RoomGallery,
                as: 'gallery',
                attributes: ['id', 'image']
            }],
            order: [['id', 'DESC']],
            limit: currentLimit,
            offset
        })

        return res.status(200).json({
            success: true,
            page: currentPage,
            limit: currentLimit,
            totalData: count,
            totalPage: Math.ceil(count / currentLimit),
            data: rows
        })
    } catch (error) {
        next(error)
    }
}

exports.getRoomById = async (req, res, next) => {
    try {
        const room = await Room.findByPk(req.params.id, {
            include: [
                {
                    model: RoomGallery,
                    as: 'gallery',
                    attributes: ['id', 'image']
                }
            ]
        })

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }

        const reviewCount = await Review.count({ where: { roomId: room.id } })
        const ratingSum = await Review.sum('rating', { where: { roomId: room.id } }) || 0
        const averageRating = reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(1)) : 0

        const likesCount = await RoomLike.count({ where: { roomId: room.id, is_like: true } })
        const dislikesCount = await RoomLike.count({ where: { roomId: room.id, is_like: false } })

        let userReaction = null
        if (req.user) {
            const reaction = await RoomLike.findOne({
                where: { roomId: room.id, userId: req.user.id }
            })
            if (reaction) {
                userReaction = reaction.is_like ? 'like' : 'dislike'
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                ...room.get({ plain: true }),
                averageRating,
                reviewCount,
                likesCount,
                dislikesCount,
                userReaction
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findByPk(req.params.id)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }
        if (req.body.room_number) {
            const existingRoom = await Room.findOne({
                where: {
                    room_number: req.body.room_number
                }
            })
            if ( existingRoom && existingRoom.id !== room.id) {
                return res.status(400).json({
                    success:false,
                    message:'Room number already exists'
                })
            }
        }

        const updateData = {}
        if (req.body.room_number) {
            updateData.room_number = req.body.room_number
        }
        if (req.body.room_type) {
            updateData.room_type = req.body.room_type
        }
        if (req.body.capacity) {
            updateData.capacity = req.body.capacity
        }
        if (req.body.price_per_night) {
            updateData.price_per_night = req.body.price_per_night
        }
        if (req.body.description) {
            updateData.description = req.body.description
        }
        if (req.body.status) {
            updateData.status = req.body.status
        }
        if (req.file) {
            updateData.image = req.file.filename
        }

        if (req.body.capacity && Number(req.body.capacity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be greater than 0'
            })
        }

        if (req.body.price_per_night && Number(req.body.price_per_night) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price per night must be greater than 0'
            })
        }

        await room.update(updateData)

        return res.status(200).json({
            success: true,
            data: room
        })
    } catch (error) {
        next(error)
    }
}

exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findByPk(req.params.id)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }
        const totalBookings = await Booking.count({
            where:{
                roomId:room.id
            }
        })
        if(totalBookings > 0){
            return res.status(400).json({
                success:false,
                message:'Room already has booking history'
            })
        }
        await room.destroy()
        return res.status(200).json({
            success: true,
            message: 'Room deleted'
        })
    } catch (error) {
        next(error)
    }
}

exports.getAvailableRooms = async (req, res, next) => {
    try {
        const { check_in, check_out } = req.query

        if (!check_in || !check_out) {
            return res.status(400).json({
                success: false,
                message: 'check_in and check_out are required'
            })
        }

        const checkInDate = new Date(check_in)
        const checkOutDate = new Date(check_out)
        if (isNaN(checkInDate) || isNaN(checkOutDate)) {
            return res.status(400).json({
                success: false,
                message: 'check_in and check_out must be valid dates'
            })
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({
                success: false,
                message: 'check_out must be after check_in'
            })
        }

        const bookedRooms = await Booking.findAll({
            where: {
                status: 'approved',
                check_in: {
                    [Op.lt]: check_out
                },
                check_out: {
                    [Op.gt]: check_in
                }
            },
            attributes: ['roomId']
        })

        const bookedRoomIds = bookedRooms.map((booking) => booking.roomId)

        const rooms = await Room.findAll({
            where: {
                id: {
                    [Op.notIn]: bookedRoomIds
                },
                status: 'available'
            }
        })

        return res.status(200).json({
            success: true,
            data: rooms
        })
    } catch (error) {
        next(error)
    }
}

exports.uploadGallery = async (req, res, next) => {
    try {
        const room = await Room.findByPk(req.params.id)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one gallery image is required'
            })
        }

        const totalGallery = await RoomGallery.count({
            where: {
                roomId: room.id
            }
        })

        if (totalGallery + req.files.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 images allowed per room'
            })
        }

        const createdImages = await Promise.all(
            req.files.map((file) =>
                RoomGallery.create({
                    roomId: room.id,
                    image: file.filename
                })
            )
        )

        return res.status(201).json({
            success: true,
            data: createdImages
        })
    } catch (error) {
        next(error)
    }
}

exports.getRoomGallery = async (req, res, next) => {
    try {
        const room = await Room.findByPk(req.params.id)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }

        const gallery = await RoomGallery.findAll({
            where: {
                roomId: room.id
            }
        })

        return res.status(200).json({
            success: true,
            data: gallery
        })
    } catch (error) {
        next(error)
    }
}

exports.deleteGallery = async (req, res, next) => {
    try {
        const gallery = await RoomGallery.findByPk(req.params.galleryId)
        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            })
        }

        const imagePath = path.join(
            __dirname, '../uploads/', gallery.image
        )
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
        }

        await gallery.destroy()
        return res.status(200).json({
            success: true,
            message: 'Gallery image deleted'
        })
    } catch (error) {
        next(error)
    }
}

exports.getRoomBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            where: { roomId: req.params.id },
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'avatar'] }
            ],
            order: [['id', 'DESC']]
        })

        return res.status(200).json({
            success: true,
            data: bookings
        })
    } catch (error) {
        next(error)
    }
}

exports.getRoomBookedDates = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            where: {
                roomId: req.params.id,
                status: 'approved'
            },
            attributes: ['check_in', 'check_out']
        })
        return res.status(200).json({
            success: true,
            data: bookings
        })
    } catch (error) {
        next(error)
    }
}
exports.exportRoomsExcel = async (req, res, next) => {
    try {
        const rooms = await Room.findAll({
            order: [['id', 'DESC']]
        })
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Rooms')

        worksheet.columns = [
            { header: 'Room Number', key: 'room_number', width: 15 },
            { header: 'Room Type', key: 'room_type', width: 20 },
            { header: 'Capacity', key: 'capacity', width: 15 },
            { header: 'Price Per Night', key: 'price_per_night', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Description', key: 'description', width: 35 }
        ]
        rooms.forEach((room) => {
            worksheet.addRow({
                room_number: room.room_number,
                room_type: room.room_type,
                capacity: room.capacity,
                price_per_night: room.price_per_night,
                status: room.status,
                description: room.description
            })
        })
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=rooms.xlsx'
        )
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        next(error)
    }
}

exports.getDeletedRooms = async (req, res, next) => {
    try {
        const rooms = await Room.findAll({
            where: { deletedAt: { [Op.ne]: null } },
            paranoid: false,
            order: [['deletedAt', 'DESC']]
        })
        return res.status(200).json({ success: true, data: rooms })
    } catch (error) {
        next(error)
    }
}

exports.restoreRoom = async (req, res, next) => {
    try {
        const room = await Room.findOne({
            where: { id: req.params.id, deletedAt: { [Op.ne]: null } },
            paranoid: false
        })
        if (!room) {
            return res.status(404).json({ success: false, message: 'Deleted room not found' })
        }
        await room.restore()
        return res.status(200).json({ success: true, message: 'Room restored successfully', data: room })
    } catch (error) {
        next(error)
    }
}

exports.permanentDeleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findOne({
            where: { id: req.params.id, deletedAt: { [Op.ne]: null } },
            paranoid: false
        })
        if (!room) {
            return res.status(404).json({ success: false, message: 'Deleted room not found' })
        }
        // Delete associated gallery images from disk
        const galleries = await RoomGallery.findAll({ where: { roomId: room.id } })
        galleries.forEach(g => {
            const filePath = path.join(__dirname, '../uploads/', g.image)
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        })
        if (room.image) {
            const imgPath = path.join(__dirname, '../uploads/', room.image)
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
        }
        await room.destroy({ force: true })
        return res.status(200).json({ success: true, message: 'Room permanently deleted' })
    } catch (error) {
        next(error)
    }
}
