const Room = require('../models/Room')
const RoomGallery = require('../models/RoomGallery')
const Booking = require('../models/Booking')
const User = require('../models/User')
const Review = require('../models/Review')

exports.getPublicRooms = async (req, res, next) => {
    try {
        const rooms = await Room.findAll({
            where: { status: 'available' },
            include: [{ model: RoomGallery, as: 'gallery', attributes: ['id', 'image'] }],
            order: [['id', 'DESC']],
            limit: 6
        })

        // Attach review stats for each room
        const roomsWithStats = await Promise.all(rooms.map(async (room) => {
            const reviewCount = await Review.count({ where: { roomId: room.id, isHidden: false } })
            const ratingSum = await Review.sum('rating', { where: { roomId: room.id, isHidden: false } }) || 0
            const averageRating = reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(1)) : 0
            return { ...room.toJSON(), averageRating, reviewCount }
        }))

        return res.status(200).json({ success: true, data: roomsWithStats })
    } catch (error) {
        next(error)
    }
}

exports.getPublicStats = async (req, res, next) => {
    try {
        const totalRooms = await Room.count({ where: { status: 'available' } })
        const totalBookings = await Booking.count({ where: { status: 'approved' } })
        const totalUsers = await User.count({ where: { role: 'user' } })

        return res.status(200).json({
            success: true,
            data: {
                totalRooms,
                totalBookings,
                totalUsers
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.getLatestReviews = async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            where: { isHidden: false },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'avatar']
                },
                {
                    model: Room,
                    as: 'room',
                    attributes: ['id', 'room_number', 'room_type']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 6
        })

        const reviewsWithVerification = await Promise.all(reviews.map(async (review) => {
            const hasBooking = await Booking.count({
                where: {
                    userId: review.userId,
                    roomId: review.roomId,
                    status: 'approved'
                }
            })

            return {
                ...review.toJSON(),
                isVerified: hasBooking > 0
            }
        }))

        const allVisible = await Review.findAll({ where: { isHidden: false } })
        const totalReviews = allVisible.length
        const avgRating = totalReviews > 0
            ? Number((allVisible.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
            : 0

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        allVisible.forEach(r => { if (distribution[r.rating] !== undefined) distribution[r.rating]++ })

        return res.status(200).json({
            success: true,
            data: reviewsWithVerification,
            meta: {
                totalReviews,
                avgRating,
                distribution
            }
        })
    } catch (error) {
        next(error)
    }
}
