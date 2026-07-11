'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            const tableDescription = await queryInterface.describeTable('amenities')
            if (!tableDescription.description) {
                await queryInterface.addColumn('amenities', 'description', {
                    type: Sequelize.TEXT,
                    allowNull: true,
                    after: 'name'
                })
            }
        } catch (err) {
            console.log('Skipping add description to amenities:', err.message)
        }
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('amenities', 'description')
    }
}
