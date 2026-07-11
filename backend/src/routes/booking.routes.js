const express = require('express')
const bookingController = require('../controllers/booking.controller')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const validation = require('../middlewares/validation')
const { createBookingValidation } = require('../validations/booking.validation')
const router = express.Router()

router.post('/', auth, createBookingValidation, validation, bookingController.createBooking)
router.get('/', auth, role('admin'), bookingController.getBookings)
router.get('/export/excel', auth, role('admin'), bookingController.exportBookingsExcel)
router.get('/me', auth, role('user'), bookingController.getMyBookingHistory)
router.delete('/:id', auth, role('user'), bookingController.cancelBooking)
router.put('/:id/status', auth, role('admin'), bookingController.updateBookingStatus)
router.get('/:id', auth, bookingController.getBookingById)  // accessible by admin and booking owner

module.exports = router