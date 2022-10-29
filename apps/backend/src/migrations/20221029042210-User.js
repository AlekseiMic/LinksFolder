'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      username: Sequelize.DataTypes.STRING(50),
      password_hash: Sequelize.DataTypes.STRING(72),
      createdAt: {
        type: 'timestamp',
        allowNull: false,
      },
      updatedAt: {
        type: 'timestamp',
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  },
};
