'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tables = ['users', 'rooms', 'bookings', 'payments', 'reviews', 'room_galleries', 'room_likes']

        for (const table of tables) {
            try {
                const tableDescription = await queryInterface.describeTable(table)
                if (!tableDescription.deletedAt) {
                    await queryInterface.addColumn(table, 'deletedAt', {
                        type: Sequelize.DATE,
                        allowNull: true
                    })
                }
            } catch {
                console.log(`Skipping ${table} — table does not exist or deletedAt already present`)
            }
        }
    },
    down: async (queryInterface) => {
        const tables = ['users', 'rooms', 'bookings', 'payments', 'reviews', 'room_galleries', 'room_likes']

        for (const table of tables) {
            try {
                const tableDescription = await queryInterface.describeTable(table)
                if (tableDescription.deletedAt) {
                    await queryInterface.removeColumn(table, 'deletedAt')
                }
            } catch {
                console.log(`Skipping ${table} — table does not exist`)
            }
        }
    }
}
