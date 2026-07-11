const { body } = require('express-validator')

exports.createBookingValidation = [
    body('roomId')
        .notEmpty()
        .withMessage('Room ID is required'),
    body('check_in')
        .isISO8601()
        .withMessage('Check in date must be valid'),
    body('check_out')
        .isISO8601()
        .withMessage('Check out date must be valid'),
    body('guest_count')
        .isInt({ min: 1 })
        .withMessage('Guest count must be greater than 0'),
    body('special_request')
        .optional()
        .isString()
        .withMessage('Special request must be a string')
]