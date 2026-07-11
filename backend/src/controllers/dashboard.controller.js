const sequelize = require("../config/database")
const Room = require("../models/Room")
const Booking = require("../models/Booking")
const User = require("../models/User")
const Payment = require("../models/payment")
const Review = require("../models/Review")
const { Op } = require("sequelize")

exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalRooms = await Room.count()
        const totalBookings = await Booking.count()
        const totalUsers = await User.count()
        const pendingBookings = await Booking.count({ where: { status: "pending" } })
        const approvedBookings = await Booking.count({ where: { status: "approved" } })
        const rejectedBookings = await Booking.count({ where: { status: "rejected" } })
        const totalRevenue = await Payment.sum("amount", { where: { status: "paid" } })
        const totalPaidPayments = await Payment.count({ where: { status: 'paid' } })
        const totalPendingPayments = await Payment.count({ where: { status: 'pending' } })
        const totalFailedPayments = await Payment.count({ where: { status: 'failed' } })
        const totalRefundedPayments = await Payment.count({ where: { status: 'refunded' } })

        // Occupancy: rooms that have at least 1 approved booking in the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const occupiedRoomIds = await Booking.findAll({
            where: {
                status: 'approved',
                check_in: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: ['roomId'],
            group: ['roomId'],
            raw: true
        })
        const occupancyRate = totalRooms > 0
            ? Math.round((occupiedRoomIds.length / totalRooms) * 100)
            : 0

        // Average review rating
        const totalReviews = await Review.count()
        const ratingSum = await Review.sum('rating') || 0
        const avgReviewRating = totalReviews > 0
            ? Number((ratingSum / totalReviews).toFixed(1))
            : 0

        const bookingChart = await Booking.findAll({
            attributes: [
                [sequelize.fn("MONTH", sequelize.col("check_in")), "month"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total"]
            ],
            where: { status: "approved" },
            group: [sequelize.fn("MONTH", sequelize.col("check_in"))],
            order: [[sequelize.fn("MONTH", sequelize.col("check_in")), "ASC"]]
        })

        return res.status(200).json({
            success: true,
            data: {
                totalRooms,
                totalBookings,
                totalUsers,
                pendingBookings,
                approvedBookings,
                rejectedBookings,
                totalRevenue: totalRevenue || 0,
                totalPaidPayments,
                totalPendingPayments,
                totalFailedPayments,
                totalRefundedPayments,
                occupancyRate,
                avgReviewRating,
                totalReviews,
                bookingChart
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.getBookingPerMonth = async (req, res, next) => {
    try {
        const bookingChart = await Booking.findAll({
            attributes: [
                [sequelize.fn("MONTH", sequelize.col("check_in")), "month"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total"]
            ],
            where: { status: "approved" },
            group: [sequelize.fn("MONTH", sequelize.col("check_in"))],
            order: [[sequelize.fn("MONTH", sequelize.col("check_in")), "ASC"]]
        })
        return res.status(200).json({
            success: true,
            data: bookingChart
        })
    } catch (error) {
        next(error)
    }
}

exports.getTopRooms = async (req, res, next) => {
    try {
        const topRooms = await Booking.findAll({
            where: { status: 'approved' },
            attributes: [
                'roomId',
                [sequelize.fn('COUNT', sequelize.col('bookings.id')), 'bookingsCount']
            ],
            include: [
                {
                    model: Room,
                    attributes: ['id', 'room_number', 'room_type', 'price_per_night']
                }
            ],
            group: ['roomId', 'Room.id'],
            order: [[sequelize.literal('bookingsCount'), 'DESC']],
            limit: 5
        })

        return res.status(200).json({
            success: true,
            data: topRooms
        })
    } catch (error) {
        next(error)
    }
}

exports.getRevenuePerMonth = async (req, res, next) => {
    try {
        const revenueChart = await Payment.findAll({
            attributes: [
                [sequelize.fn("MONTH", sequelize.col("payment_date")), "month"],
                [sequelize.fn("SUM", sequelize.col("amount")), "revenue"]
            ],
            where: { status: "paid" },
            group: [sequelize.fn("MONTH", sequelize.col("payment_date"))],
            order: [[sequelize.fn("MONTH", sequelize.col("payment_date")), "ASC"]]
        })

        res.status(200).json({
            success: true,
            data: revenueChart
        })
    } catch (error) {
        next(error)
    }
}

exports.getUserDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id

        const [totalBookings, pendingBookings, approvedBookings, rejectedBookings, payments, bookingChart, recentBookings] = await Promise.all([
            Booking.count({ where: { userId } }),
            Booking.count({ where: { userId, status: "pending" } }),
            Booking.count({ where: { userId, status: "approved" } }),
            Booking.count({ where: { userId, status: "rejected" } }),
            Payment.findAll({
                include: [{
                    model: Booking,
                    where: { userId },
                    required: true
                }]
            }),
            Booking.findAll({
                attributes: [
                    [sequelize.fn("MONTH", sequelize.col("check_in")), "month"],
                    [sequelize.fn("COUNT", sequelize.col("id")), "total"]
                ],
                where: { userId, status: "approved" },
                group: [sequelize.fn("MONTH", sequelize.col("check_in"))],
                order: [[sequelize.fn("MONTH", sequelize.col("check_in")), "ASC"]],
                raw: true
            }),
            Booking.findAll({
                where: { userId },
                include: [
                    {
                        model: Room,
                        attributes: ['id', 'room_number', 'room_type', 'price_per_night']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 5
            })
        ])

        const paidPayments = payments.filter(p => p.status === 'paid').length
        const pendingPayments = payments.filter(p => p.status === 'pending').length
        const failedPayments = payments.filter(p => p.status === 'failed').length
        const refundedPayments = payments.filter(p => p.status === 'refunded').length
        const totalSpent = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)

        const mappedRecentBookings = recentBookings.map(booking => ({
            id: booking.id,
            check_in: booking.check_in,
            check_out: booking.check_out,
            status: booking.status,
            booking_code: booking.booking_code,
            total_price: booking.total_price,
            room: booking.room ? {
                id: booking.room.id,
                room_number: booking.room.room_number,
                room_type: booking.room.room_type,
                price_per_night: booking.room.price_per_night
            } : null
        }))

        return res.status(200).json({
            success: true,
            data: {
                totalBookings,
                totalSpent,
                pendingBookings,
                approvedBookings,
                rejectedBookings,
                paidPayments,
                pendingPayments,
                failedPayments,
                refundedPayments,
                bookingChart,
                recentBookings: mappedRecentBookings
            }
        })
    } catch (error) {
        next(error)
    }
}