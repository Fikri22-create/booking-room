const jwt = require('jsonwebtoken')
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: 'JWT_SECRET is not configured'
        })
    }
    if (
        !authHeader ||
        !authHeader.startsWith('Bearer ')
    ) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
    }
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }
}

module.exports = auth