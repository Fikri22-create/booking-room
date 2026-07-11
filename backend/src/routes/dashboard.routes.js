const express = require('express')
const dashboardController = require('../controllers/dashboard.controller')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const router = express.Router()

router.get('/', auth, role('admin'), dashboardController.getDashboardStats)
router.get('/bookings-per-month', auth, role('admin'), dashboardController.getBookingPerMonth)
router.get('/top-rooms', auth, role('admin'), dashboardController.getTopRooms)
router.get('/revenue-per-month', auth, role('admin'), dashboardController.getRevenuePerMonth)
router.get('/user', auth, role('user'), dashboardController.getUserDashboardStats)
module.exports = router