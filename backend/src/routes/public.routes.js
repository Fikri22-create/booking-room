const express = require('express')
const router = express.Router()
const publicController = require('../controllers/public.controller')

router.get('/rooms', publicController.getPublicRooms)
router.get('/stats', publicController.getPublicStats)
router.get('/reviews/latest', publicController.getLatestReviews)

module.exports = router
