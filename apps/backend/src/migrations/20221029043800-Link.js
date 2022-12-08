'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi, Sequelize) {
    return qi
      .createTable('Links', {
        id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        url: Sequelize.DataTypes.STRING,
        text: Sequelize.DataTypes.STRING,
        sort: Sequelize.DataTypes.INTEGER,
        directoryId: {
          type: Sequelize.DataTypes.INTEGER,
          references: { model: 'Directories', key: 'id' },
          onDelete: 'CASCADE'
        },
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
      .then(() => {
        qi.addIndex('Links', ['directoryId']);
        qi.addIndex('Links', ['createdBy']);
      });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable('Links');
  },
};
