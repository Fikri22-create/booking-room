const { body } = require('express-validator')

exports.createRoomValidation = [
    body('room_number')
        .notEmpty()
        .withMessage('Room number is required'),
    body('room_type')
        .isIn(['standard', 'deluxe', 'suite'])
        .withMessage('Room type must be standard, deluxe, or suite'),
    body('capacity')
        .isInt({ min: 1 })
        .withMessage('Capacity must be greater than 0'),
    body('price_per_night')
        .isInt({ min: 1 })
        .withMessage('Price per night must be greater than 0'),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
]
exports.updateRoomValidation = [
    body('room_number')
        .optional()
        .notEmpty()
        .withMessage('Room number cannot be empty'),
    body('room_type')
        .optional()
        .isIn(['standard', 'deluxe', 'suite'])
        .withMessage('Room type must be standard, deluxe, or suite'),
    body('capacity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Capacity must be greater than 0'),
    body('price_per_night')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Price per night must be greater than 0'),
    body('description')
        .optional()
        .notEmpty()
        .withMessage('Description cannot be empty'),
    body('status')
        .optional()
        .isIn(['available', 'maintenance'])
        .withMessage('Status must be available or maintenance')
]