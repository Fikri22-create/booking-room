const express = require('express')
const reviewController = require('../controllers/review.controller')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')
const router = express.Router()

router.get('/rooms/:id/reviews', auth, reviewController.getRoomReviews)
router.post('/rooms/:id/reviews', auth, reviewController.createReview)
router.put('/reviews/:id', auth, reviewController.updateReview)
router.post('/rooms/:id/like', auth, reviewController.toggleLike)
router.post('/rooms/:id/dislike', auth, reviewController.toggleDislike)
router.delete('/reviews/:id', auth, reviewController.deleteReview)
router.patch('/reviews/:id/hide', auth, role('admin'), reviewController.toggleHideReview)
router.get('/reviews', auth, role('admin'), reviewController.getAllReviews)
router.get('/my-reviews', auth, reviewController.getUserReviews)

module.exports = router
