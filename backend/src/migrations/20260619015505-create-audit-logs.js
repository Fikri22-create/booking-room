module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('audit_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            entity: {
                type: Sequelize.STRING,
                allowNull: false
            },
            entityId: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            oldValues: {
                type: Sequelize.JSON,
                allowNull: true
            },
            newValues: {
                type: Sequelize.JSON,
                allowNull: true
            },
            ipAddress: {
                type: Sequelize.STRING,
                allowNull: true
            },
            userAgent: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        })

        await queryInterface.addIndex('audit_logs', ['userId', 'action', 'entity'])
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('audit_logs')
    }
}
