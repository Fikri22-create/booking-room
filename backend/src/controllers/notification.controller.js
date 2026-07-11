const Notification = require('../models/Notification')

exports.getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { page = 1, limit = 10 } = req.query
        const offset = (page - 1) * limit
        const { count, rows } = await Notification.findAndCountAll({
            where: { userId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        })
        return res.status(200).json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            totalData: count,
            totalPage: Math.ceil(count / limit),
            data: rows
        })
    } catch (error) {
        next(error)
    }
}

exports.getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id
        const count = await Notification.count({
            where: { userId, isRead: false }
        })
        return res.status(200).json({
            success: true,
            count
        })
    } catch (error) {
        next(error)
    }
}

exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const notification = await Notification.findOne({
            where: { id, userId }
        })
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            })
        }
        await notification.update({ isRead: true })
        return res.status(200).json({
            success: true,
            data: notification,
            message: 'Notification marked as read'
        })
    } catch (error) {
        next(error)
    }
}

exports.markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id
        await Notification.update(
            { isRead: true },
            { where: { userId, isRead: false } }
        )
        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        })
    } catch (error) {
        next(error)
    }
}

exports.deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const notification = await Notification.findOne({
            where: { id, userId }
        })
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            })
        }
        await notification.destroy()
        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}

exports.clearAllNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id
        await Notification.destroy({ where: { userId } })
        return res.status(200).json({
            success: true,
            message: 'All notifications cleared'
        })
    } catch (error) {
        next(error)
    }
}

exports.createNotification = async (userId, title, message, type = 'system', link = null, icon = null) => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type,
            link,
            icon
        })
    } catch (error) {
        console.error('Create notification error:', error)
    }
}

module.exports = exports
