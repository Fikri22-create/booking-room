const express = require('express')
const authRoutes = require('./auth.routes')
const roomRoutes = require('./room.routes')
const bookingRoutes = require('./booking.routes')
const dashboardRoutes = require('./dashboard.routes')
const paymentRoutes = require('./payment.routes')
const publicRoutes = require('./public.routes')
const userRoutes = require('./user.routes')
const reviewRoutes = require('./review.routes')
const amenityRoutes = require('./amenity.routes')
const wishlistRoutes = require('./wishlist.routes')
const notificationRoutes = require('./notification.routes')
const auditLogRoutes = require('./auditLog.routes')
const router = express.Router()

router.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'API Running'
    })
})

router.use('/auth', authRoutes)
router.use('/rooms', roomRoutes)
router.use('/bookings', bookingRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/payments', paymentRoutes)
router.use('/public', publicRoutes)
router.use('/users', userRoutes)
router.use('/amenities', amenityRoutes)
router.use('/wishlist', wishlistRoutes)
router.use('/notifications', notificationRoutes)
router.use('/audit-logs', auditLogRoutes)
router.use('/', reviewRoutes)

module.exports = router
