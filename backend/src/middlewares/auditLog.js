const AuditLog = require('../models/AuditLog')

const createAuditLog = async (userId, action, entity, entityId, oldValues, newValues, req, description) => {
    try {
        await AuditLog.create({
            userId,
            action,
            entity,
            entityId,
            oldValues,
            newValues,
            ipAddress: req?.ip || req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress,
            userAgent: req?.headers['user-agent'],
            description
        })
    } catch (error) {
        console.error('Audit log error:', error)
    }
}

const auditLog = (action, entity) => {
    return async (req, res, next) => {
        const originalSend = res.send
        res.send = function (data) {
            try {
                const responseData = JSON.parse(data)
                if (responseData.success && req.user) {
                    const userId = req.user.id
                    const entityId = req.params.id || responseData.data?.id
                    const oldValues = req.body.oldValues || null
                    const newValues = req.body || responseData.data
                    
                    createAuditLog(
                        userId,
                        action,
                        entity,
                        entityId,
                        oldValues,
                        newValues,
                        req,
                        `${action} ${entity}`
                    )
                }
            } catch (error) {
            }
            originalSend.call(this, data)
        }
        next()
    }
}

module.exports = { auditLog, createAuditLog }
