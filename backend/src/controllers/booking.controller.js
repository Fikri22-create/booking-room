const Booking = require('../models/Booking')
const Room = require('../models/Room')
const User = require('../models/User')
const { Op } = require('sequelize')
const ExcelJS = require('exceljs')
const Payment = require('../models/payment')
const { sendBookingConfirmation } = require('../services/emailService')
const { createNotification } = require('../controllers/notification.controller')
const { createAuditLog } = require('../middlewares/auditLog')

const formatBookingCode = async (check_in) => {
    const date = new Date(check_in)
    const dateCode = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const prefix = `HTL-${dateCode}-`
    const lastBooking = await Booking.findOne({
        where: {
            booking_code: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['createdAt', 'DESC']]
    })
    const nextNumber = lastBooking
        ? Number(lastBooking.booking_code.slice(-4)) + 1
        : 1
    return `${prefix}${String(nextNumber).padStart(4, '0')}`
}

const calculateNights = (check_in, check_out) => {
    const start = new Date(check_in)
    const end = new Date(check_out)
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.max(1, Math.floor((end - start) / msPerDay))
}

exports.createBooking = async (req, res, next) => {
    try {
        const { roomId, check_in, check_out, guest_count, special_request } = req.body

        if (!roomId || !check_in || !check_out || guest_count === undefined) {
            return res.status(400).json({
                success: false,
                message: 'roomId, check_in, check_out and guest_count are required'
            })
        }

        const checkInDate = new Date(check_in)
        const checkOutDate = new Date(check_out)
        if (isNaN(checkInDate) || isNaN(checkOutDate)) {
            return res.status(400).json({
                success: false,
                message: 'Check in and check out must be valid dates'
            })
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({
                success: false,
                message: 'Check out date must be after check in date'
            })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        checkInDate.setHours(0, 0, 0, 0)

        if (checkInDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Check in date cannot be in the past'
            })
        }

        const room = await Room.findByPk(roomId)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }

        if (room.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Room is not available for booking'
            })
        }

        const guestCount = Number(guest_count)
        if (guestCount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Guest count must be greater than 0'
            })
        }

        if (guestCount > room.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Guest count exceeds room capacity'
            })
        }

        const conflictBooking = await Booking.findOne({
            where: {
                roomId,
                status: 'approved',
                check_in: {
                    [Op.lt]: check_out
                },
                check_out: {
                    [Op.gt]: check_in
                }
            }
        })

        if (conflictBooking) {
            return res.status(400).json({
                success: false,
                message: 'Room is already booked for the requested dates'
            })
        }

        const nights = calculateNights(check_in, check_out)
        const total_price = nights * room.price_per_night
        const booking_code = await formatBookingCode(check_in)

        const booking = await Booking.create({
            userId: req.user.id,
            roomId,
            check_in,
            check_out,
            guest_count: guestCount,
            special_request,
            total_price,
            booking_code
        })

        const user = await User.findByPk(req.user.id)
        
        try {
            await sendBookingConfirmation(booking, user, room)
        } catch (emailError) {
            console.error('Failed to send booking email:', emailError)
        }

        try {
            await createNotification(
                req.user.id,
                'Booking Created',
                `Your booking ${booking_code} has been successfully created. Please upload payment proof to confirm.`,
                'booking',
                `/user/my-bookings`,
                'calendar'
            )
        } catch (notifError) {
            console.error('Failed to create notification:', notifError)
        }


        await createAuditLog(req.user.id, 'CREATE', 'Booking', booking.id, null, booking.toJSON(), req, 'Booking created')

        return res.status(201).json({
            success: true,
            data: booking
        })
    } catch (error) {
        next(error)
    }
}

exports.getBookings = async (req, res, next) => {
    try {
        const {
            status,
            check_in,
            page = 1,
            limit = 10
        } = req.query

        const currentPage = Math.max(Number(page), 1)
        const currentLimit = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (currentPage - 1) * currentLimit

        const whereClause = {}
        if (status) whereClause.status = status
        if (check_in) whereClause.check_in = check_in

        const { count, rows } = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Room },
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Payment}
            ],
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

exports.getMyBookingHistory = async (req, res, next) => {
    try {
        const {
            status,
            page = 1,
            limit = 10
        } = req.query

        const currentPage = Math.max(Number(page), 1)
        const currentLimit = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (currentPage - 1) * currentLimit

        const whereClause = {
            userId: req.user.id
        }
        if (status) whereClause.status = status

        const { count, rows } = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Room },
                { model: Payment, attributes: ['id', 'status', 'payment_code'] }
            ],
            order: [['id', 'DESC']],
            limit: currentLimit,
            offset
        })

        const data = rows.map((booking) => ({
            id: booking.id,
            booking_code: booking.booking_code,
            room: booking.room
                ? {
                    id: booking.room.id,
                    room_number: booking.room.room_number,
                    room_type: booking.room.room_type,
                    capacity: booking.room.capacity,
                    price_per_night: booking.room.price_per_night
                }
                : null,
            payment: booking.payment || null,
            check_in: booking.check_in,
            check_out: booking.check_out,
            guest_count: booking.guest_count,
            total_price: booking.total_price,
            status: booking.status
        }))

        return res.status(200).json({
            success: true,
            page: currentPage,
            limit: currentLimit,
            totalData: count,
            totalPage: Math.ceil(count / currentLimit),
            data
        })
    } catch (error) {
        next(error)
    }
}

exports.updateBookingStatus = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id)
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            })
        }

        const { status } = req.body
        if (status !== 'approved' && status !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            })
        }

        booking.status = status
        await booking.save()

        const user = await User.findByPk(booking.userId)
        const room = await Room.findByPk(booking.roomId)

        try {
            const statusMessage = status === 'approved' 
                ? 'Your booking has been approved!' 
                : 'Your booking has been rejected.'
            
            await createNotification(
                booking.userId,
                `Booking ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                statusMessage,
                'booking',
                `/user/my-bookings`,
                status === 'approved' ? 'check-circle' : 'x-circle'
            )
        } catch (notifError) {
            console.error('Failed to create notification:', notifError)
        }

        await createAuditLog(req.user.id, 'UPDATE', 'Booking', booking.id, { status: booking.status }, { status }, req, `Booking status updated to ${status}`)

        return res.status(200).json({
            success: true,
            data: booking
        })
    } catch (error) {
        next(error)
    }
}

exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id)
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            })
        }

        if (booking.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden access'
            })
        }

        if (booking.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Approved booking cannot be cancelled'
            })
        }

        await booking.destroy()

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled'
        })
    } catch (error) {
        next(error)
    }
}

exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: Room },
                { model: User, attributes: ['id', 'name', 'email', 'phone', 'address', 'avatar'] },
                { model: Payment }
            ]
        })

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            })
        }

        // Allow access to admin or the booking owner
        const isAdmin = req.user.role === 'admin'
        const isOwner = booking.userId === req.user.id
        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: you do not have access to this booking'
            })
        }

        return res.status(200).json({
            success: true,
            data: booking
        })
    } catch (error) {
        next(error)
    }
}


exports.exportBookingsExcel = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, attributes: ['name'] },
                { model: Room, attributes: ['room_number', 'room_type'] }
            ],
            order: [['id', 'DESC']]
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Bookings')

        worksheet.columns = [
            { header: 'Booking Code', key: 'booking_code', width: 20 },
            { header: 'User', key: 'user', width: 25 },
            { header: 'Room Number', key: 'room_number', width: 20 },
            { header: 'Room Type', key: 'room_type', width: 15 },
            { header: 'Check In', key: 'check_in', width: 15 },
            { header: 'Check Out', key: 'check_out', width: 15 },
            { header: 'Guest Count', key: 'guest_count', width: 15 },
            { header: 'Total Price', key: 'total_price', width: 15 },
            { header: 'Booking Status', key: 'status', width: 15 }
        ]

        bookings.forEach((booking) => {
            worksheet.addRow({
                booking_code: booking.booking_code,
                user: booking.user?.name,
                room_number: booking.room?.room_number,
                room_type: booking.room?.room_type,
                check_in: booking.check_in,
                check_out: booking.check_out,
                guest_count: booking.guest_count,
                total_price: booking.total_price,
                status: booking.status
            })
        })

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=bookings.xlsx'
        )

        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        next(error)
    }
}
