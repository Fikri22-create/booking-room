'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'phone', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'email'
        });
        await queryInterface.addColumn('users', 'address', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'phone'
        });
        await queryInterface.addColumn('users', 'avatar', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'address'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('users', 'phone');
        await queryInterface.removeColumn('users', 'address');
        await queryInterface.removeColumn('users', 'avatar');
    }
};
