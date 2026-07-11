const Review = require('../models/Review')
const RoomLike = require('../models/RoomLike')
const Booking = require('../models/Booking')
const User = require('../models/User')
const Room = require('../models/Room')

exports.createReview = async (req, res, next) => {
    try {
        const { rating, title, comment } = req.body
        const roomId = req.params.id
        const userId = req.user.id

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            })
        }

        const parsedRating = parseInt(rating)
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            })
        }

        const room = await Room.findByPk(roomId)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }

        const existingReview = await Review.findOne({
            where: { roomId, userId }
        })
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this room'
            })
        }

        const review = await Review.create({
            roomId,
            userId,
            rating: parsedRating,
            title: title || null,
            comment
        })

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'avatar']
        })

        const hasApprovedBooking = await Booking.findOne({
            where: { userId, roomId, status: 'approved' }
        })

        return res.status(201).json({
            success: true,
            data: {
                ...review.get({ plain: true }),
                user,
                isVerified: !!hasApprovedBooking
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findByPk(req.params.id)
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' })
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only edit your own reviews' })
        }

        const { rating, title, comment } = req.body

        if (rating) {
            const parsedRating = parseInt(rating)
            if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                })
            }
            review.rating = parsedRating
        }

        if (comment !== undefined) review.comment = comment
        if (title !== undefined) review.title = title || null

        await review.save()

        const user = await User.findByPk(review.userId, {
            attributes: ['id', 'name', 'avatar']
        })

        const hasApprovedBooking = await Booking.findOne({
            where: { userId: review.userId, roomId: review.roomId, status: 'approved' }
        })

        return res.status(200).json({
            success: true,
            data: {
                ...review.get({ plain: true }),
                user,
                isVerified: !!hasApprovedBooking
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.getRoomReviews = async (req, res, next) => {
    try {
        const roomId = req.params.id

        const reviews = await Review.findAll({
            where: { roomId, isHidden: false },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'avatar']
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        const mappedReviews = await Promise.all(reviews.map(async (review) => {
            const hasApprovedBooking = await Booking.findOne({
                where: {
                    userId: review.userId,
                    roomId: review.roomId,
                    status: 'approved'
                }
            })
            return {
                ...review.get({ plain: true }),
                isVerified: !!hasApprovedBooking
            }
        }))

        return res.status(200).json({
            success: true,
            data: mappedReviews
        })
    } catch (error) {
        next(error)
    }
}

exports.toggleLike = async (req, res, next) => {
    try {
        const roomId = req.params.id
        const userId = req.user.id

        const room = await Room.findByPk(roomId)
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' })
        }

        const existingReaction = await RoomLike.findOne({
            where: { roomId, userId }
        })

        if (existingReaction) {
            if (existingReaction.is_like) {
                await existingReaction.destroy()
                return res.status(200).json({ success: true, message: 'Like removed', status: null })
            } else {
                existingReaction.is_like = true
                await existingReaction.save()
                return res.status(200).json({ success: true, message: 'Changed to like', status: 'like' })
            }
        } else {
            await RoomLike.create({ roomId, userId, is_like: true })
            return res.status(201).json({ success: true, message: 'Room liked', status: 'like' })
        }
    } catch (error) {
        next(error)
    }
}

exports.toggleDislike = async (req, res, next) => {
    try {
        const roomId = req.params.id
        const userId = req.user.id

        const room = await Room.findByPk(roomId)
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' })
        }

        const existingReaction = await RoomLike.findOne({
            where: { roomId, userId }
        })

        if (existingReaction) {
            if (!existingReaction.is_like) {
                await existingReaction.destroy()
                return res.status(200).json({ success: true, message: 'Dislike removed', status: null })
            } else {
                existingReaction.is_like = false
                await existingReaction.save()
                return res.status(200).json({ success: true, message: 'Changed to dislike', status: 'dislike' })
            }
        } else {
            await RoomLike.create({ roomId, userId, is_like: false })
            return res.status(201).json({ success: true, message: 'Room disliked', status: 'dislike' })
        }
    } catch (error) {
        next(error)
    }
}

exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByPk(req.params.id)
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' })
        }

        if (req.user.role !== 'admin' && review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }

        await review.destroy()
        return res.status(200).json({ success: true, message: 'Review deleted successfully' })
    } catch (error) {
        next(error)
    }
}

exports.toggleHideReview = async (req, res, next) => {
    try {
        const review = await Review.findByPk(req.params.id)
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' })
        }

        review.isHidden = !review.isHidden
        await review.save()

        return res.status(200).json({
            success: true,
            message: review.isHidden ? 'Review hidden successfully' : 'Review visible again',
            data: review
        })
    } catch (error) {
        next(error)
    }
}

exports.getAllReviews = async (req, res, next) => {
    try {
        const { search, rating, isHidden, page = 1, limit = 20 } = req.query
        const { Op } = require('sequelize')

        const currentPage = Math.max(Number(page), 1)
        const currentLimit = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (currentPage - 1) * currentLimit

        const whereClause = {}
        if (rating) whereClause.rating = parseInt(rating)
        if (isHidden !== undefined && isHidden !== '') whereClause.isHidden = isHidden === 'true'

        const userWhere = {}
        const roomWhere = {}

        if (search) {
            whereClause[Op.or] = [
                { comment: { [Op.like]: `%${search}%` } },
                { title: { [Op.like]: `%${search}%` } }
            ]
        }

        const { count, rows } = await Review.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'avatar']
                },
                {
                    model: Room,
                    as: 'room',
                    attributes: ['id', 'room_number', 'room_type']
                }
            ],
            order: [['createdAt', 'DESC']],
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

exports.getUserReviews = async (req, res, next) => {
    try {
        const userId = req.user.id

        const reviews = await Review.findAll({
            where: { userId },
            include: [
                {
                    model: Room,
                    as: 'room',
                    attributes: ['id', 'room_number', 'room_type', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        return res.status(200).json({
            success: true,
            data: reviews
        })
    } catch (error) {
        next(error)
    }
}
