'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('reviews', 'title', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'userId'
        })
        await queryInterface.addColumn('reviews', 'isHidden', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            after: 'comment'
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('reviews', 'title')
        await queryInterface.removeColumn('reviews', 'isHidden')
    }
}
