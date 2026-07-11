const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const PasswordReset = sequelize.define('password_resets', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

User.hasMany(PasswordReset, { foreignKey: 'userId', as: 'passwordResets' })
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' })

module.exports = PasswordReset
