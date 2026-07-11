const AuditLog = require('../models/AuditLog')
const User = require('../models/User')
const sequelize = require('../config/database')
const { Op } = require('sequelize')

exports.getAllAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, action, entity, userId, startDate, endDate } = req.query
        const offset = (page - 1) * limit
        const where = {}
        if (action) {
            where.action = { [Op.like]: `%${action}%` }
        }
        if (entity) {
            where.entity = entity
        }
        if (userId) {
            where.userId = userId
        }
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        }
        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'role']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        })
        return res.status(200).json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            totalData: count,
            totalPage: Math.ceil(count / limit),
            data: rows
        })
    } catch (error) {
        next(error)
    }
}

exports.getAuditLogById = async (req, res, next) => {
    try {
        const auditLog = await AuditLog.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'role']
            }]
        })
        if (!auditLog) {
            return res.status(404).json({
                success: false,
                message: 'Audit log not found'
            })
        }
        return res.status(200).json({
            success: true,
            data: auditLog
        })
    } catch (error) {
        next(error)
    }
}

exports.getMyAuditLogs = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { page = 1, limit = 20 } = req.query
        const offset = (page - 1) * limit
        const { count, rows } = await AuditLog.findAndCountAll({
            where: { userId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        })
        return res.status(200).json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            totalData: count,
            totalPage: Math.ceil(count / limit),
            data: rows
        })
    } catch (error) {
        next(error)
    }
}

exports.getAuditStats = async (req, res, next) => {
    try {
        const totalLogs = await AuditLog.count()
        const actionStats = await AuditLog.findAll({
            attributes: [
                'action',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['action'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        })
        const entityStats = await AuditLog.findAll({
            attributes: [
                'entity',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['entity'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        })
        return res.status(200).json({
            success: true,
            data: {
                totalLogs,
                actionStats,
                entityStats
            }
        })
    } catch (error) {
        next(error)
    }
}
