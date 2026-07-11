const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const AuditLog = sequelize.define('audit_logs', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    oldValues: {
        type: DataTypes.JSON,
        allowNull: true
    },
    newValues: {
        type: DataTypes.JSON,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' })
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' })

module.exports = AuditLog
