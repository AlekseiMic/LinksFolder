'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi, Sequelize) {
    return qi
      .createTable('Directories', {
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
          onDelete: 'CASCADE'
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
      .then(() => qi.addIndex('Directories', ['lft', 'rht', 'depth']));
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable('Directories');
  },
};
