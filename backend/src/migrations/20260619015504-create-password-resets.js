module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('password_resets', {
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
            token: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            used: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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

        await queryInterface.addIndex('password_resets', ['token'])
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('password_resets')
    }
}
