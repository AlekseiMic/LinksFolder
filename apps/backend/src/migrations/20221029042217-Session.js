'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('Sessions', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      token: {
        type: Sequelize.DataTypes.STRING(255),
        unique: 'idx_refresh-token',
      },
      ip: Sequelize.DataTypes.STRING(255),
      ua: Sequelize.DataTypes.STRING(255),
      createdBy: {
        type: Sequelize.DataTypes.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
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
    return queryInterface.dropTable('Sessions');
  },
};
