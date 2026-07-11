const rateLimit = require('express-rate-limit')

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts. Try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
})
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        success: false,
        message: 'Too many requests.'
    },
    standardHeaders: true,
    legacyHeaders: false
})