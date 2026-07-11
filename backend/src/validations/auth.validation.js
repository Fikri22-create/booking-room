const { body } = require('express-validator')

exports.registerValidation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required'),
    body('email')
        .isEmail()
        .withMessage('Invalid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password minimum 6 characters')
]
exports.loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Invalid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
]