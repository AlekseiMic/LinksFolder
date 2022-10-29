'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi, Sequelize) {
    return qi
      .createTable('Directory', {
        id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        name: Sequelize.DataTypes.STRING(),
        lft: Sequelize.DataTypes.INTEGER,
        rht: Sequelize.DataTypes.INTEGER,
        depth: Sequelize.DataTypes.INTEGER,
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
      })
      .then(() => qi.addIndex('Directory', ['lft', 'rht', 'depth']));
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable('Directory');
  },
};
