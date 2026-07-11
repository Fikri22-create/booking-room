const express = require('express')
const authController = require('../controllers/auth.controller')
const router = express.Router()
const validation = require('../middlewares/validation')
const { registerValidation, loginValidation } = require('../validations/auth.validation')
const { authLimiter } = require('../middlewares/rateLimiter')

router.post('/register', authLimiter, registerValidation, validation, authController.register)
router.post('/login', authLimiter, loginValidation, validation, authController.login)
router.post('/forgot-password', authLimiter, authController.forgotPassword)
router.post('/reset-password', authLimiter, authController.resetPassword)

module.exports = router