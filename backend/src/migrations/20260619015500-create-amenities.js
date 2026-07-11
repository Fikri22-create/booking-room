module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('amenities', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            icon: {
                type: Sequelize.STRING,
                allowNull: true
            },
            category: {
                type: Sequelize.ENUM('basic', 'entertainment', 'bathroom', 'comfort', 'safety', 'food'),
                defaultValue: 'basic'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE
            }
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('amenities')
    }
}
