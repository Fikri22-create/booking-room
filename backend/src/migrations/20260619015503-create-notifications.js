module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            type: {
                type: Sequelize.ENUM('booking', 'payment', 'system', 'review'),
                defaultValue: 'system'
            },
            isRead: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            link: {
                type: Sequelize.STRING,
                allowNull: true
            },
            icon: {
                type: Sequelize.STRING,
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

        await queryInterface.addIndex('notifications', ['userId', 'isRead'])
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('notifications')
    }
}
