module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('wishlists', {
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
            roomId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'rooms',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

        await queryInterface.addIndex('wishlists', ['userId', 'roomId'], {
            unique: true,
            name: 'unique_user_room_wishlist'
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('wishlists')
    }
}
