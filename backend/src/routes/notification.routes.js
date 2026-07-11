const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const notificationController = require('../controllers/notification.controller')

router.get('/me', auth, notificationController.getMyNotifications)
router.get('/unread-count', auth, notificationController.getUnreadCount)
router.patch('/:id/read', auth, notificationController.markAsRead)
router.patch('/mark-all-read', auth, notificationController.markAllAsRead)
router.delete('/:id', auth, notificationController.deleteNotification)
router.delete('/', auth, notificationController.clearAllNotifications)

module.exports = router
