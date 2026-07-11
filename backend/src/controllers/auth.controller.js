const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const PasswordReset = require('../models/PasswordReset')
const { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetSuccess } = require('../services/emailService')
const { createAuditLog } = require('../middlewares/auditLog')

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimum 6 characters'
            })
        }
        const existingUser = await User.findOne({
            where: { email }
        })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })
        try {
            await sendWelcomeEmail(user)
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError)
        }
        await createAuditLog(user.id, 'CREATE', 'User', user.id, null, { name, email }, req, 'User registered')
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
        return res.status(201).json({
            success: true,
            data: userResponse
        })
    } catch (error) {
        next(error)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({
            where: { email }
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Wrong password'
            })
        }
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured')
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )
        await createAuditLog(user.id, 'LOGIN', 'User', user.id, null, null, req, 'User logged in')
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        }
        return res.status(200).json({
            success: true,
            token,
            user: userResponse
        })
    } catch (error) {
        next(error)
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            })
        }
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        const resetToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
        await PasswordReset.create({
            userId: user.id,
            token: hashedToken,
            expiresAt
        })
        try {
            await sendPasswordResetEmail(user, resetToken)
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError)
            return res.status(500).json({
                success: false,
                message: 'Failed to send reset email'
            })
        }
        await createAuditLog(user.id, 'REQUEST_RESET', 'User', user.id, null, null, req, 'Password reset requested')
        return res.status(200).json({
            success: true,
            message: 'Password reset link has been sent to your email'
        })
    } catch (error) {
        next(error)
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimum 6 characters'
            })
        }
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        const passwordReset = await PasswordReset.findOne({
            where: {
                token: hashedToken,
                used: false,
                expiresAt: { [require('sequelize').Op.gt]: new Date() }
            },
            include: [{ model: User, as: 'user' }]
        })
        if (!passwordReset) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await passwordReset.user.update({ password: hashedPassword })
        await passwordReset.update({ used: true })
        try {
            await sendPasswordResetSuccess(passwordReset.user)
        } catch (emailError) {
            console.error('Failed to send success email:', emailError)
        }
        await createAuditLog(passwordReset.user.id, 'RESET_PASSWORD', 'User', passwordReset.user.id, null, null, req, 'Password reset successful')
        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        })
    } catch (error) {
        next(error)
    }
}

