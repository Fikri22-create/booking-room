const Wishlist = require('../models/Wishlist')
const Room = require('../models/Room')
const RoomGallery = require('../models/RoomGallery')
const Review = require('../models/Review')
const { Sequelize } = require('sequelize')

exports.getMyWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id
        const wishlists = await Wishlist.findAll({
            where: { userId },
            include: [{
                model: Room,
                as: 'room',
                include: [{
                    model: RoomGallery,
                    as: 'gallery',
                    attributes: ['id', 'image'],
                    limit: 1
                }]
            }],
            order: [['createdAt', 'DESC']]
        })

        // Compute averageRating and reviewCount per room separately (safe, no GROUP BY)
        const result = await Promise.all(wishlists.map(async (item) => {
            const plain = item.toJSON()
            if (plain.room) {
                const reviewCount = await Review.count({ where: { roomId: plain.room.id, isHidden: false } })
                const ratingSum = await Review.sum('rating', { where: { roomId: plain.room.id, isHidden: false } }) || 0
                plain.room.averageRating = reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(1)) : 0
                plain.room.reviewCount = reviewCount
            }
            return plain
        }))

        return res.status(200).json({ success: true, data: result })
    } catch (error) {
        next(error)
    }
}

exports.toggleWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { roomId } = req.body
        const room = await Room.findByPk(roomId)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }
        const existingWishlist = await Wishlist.findOne({
            where: { userId, roomId }
        })
        if (existingWishlist) {
            await existingWishlist.destroy()
            return res.status(200).json({
                success: true,
                message: 'Room removed from wishlist',
                inWishlist: false
            })
        } else {
            await Wishlist.create({ userId, roomId })
            return res.status(201).json({
                success: true,
                message: 'Room added to wishlist',
                inWishlist: true
            })
        }
    } catch (error) {
        next(error)
    }
}

exports.checkWishlistStatus = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { roomId } = req.params
        const wishlist = await Wishlist.findOne({
            where: { userId, roomId }
        })
        return res.status(200).json({
            success: true,
            inWishlist: !!wishlist
        })
    } catch (error) {
        next(error)
    }
}

exports.clearWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id
        await Wishlist.destroy({ where: { userId } })
        return res.status(200).json({
            success: true,
            message: 'Wishlist cleared successfully'
        })
    } catch (error) {
        next(error)
    }
}
