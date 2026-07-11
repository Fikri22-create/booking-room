const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const wishlistController = require('../controllers/wishlist.controller')

router.get('/me', auth, wishlistController.getMyWishlist)
router.post('/toggle', auth, wishlistController.toggleWishlist)
router.get('/check/:roomId', auth, wishlistController.checkWishlistStatus)
router.delete('/clear', auth, wishlistController.clearWishlist)

module.exports = router
