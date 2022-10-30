'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi, Sequelize) {
    return qi
      .createTable('DirectoryAccesses', {
        id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        code: Sequelize.DataTypes.STRING,
        token: Sequelize.DataTypes.STRING,
        directoryId: {
          type: Sequelize.DataTypes.INTEGER,
          references: { model: 'Directories', key: 'id' },
        },
        userId: {
          type: Sequelize.DataTypes.INTEGER,
          references: { model: 'Users', key: 'id' },
        },
        createdBy: {
          type: Sequelize.DataTypes.INTEGER,
          references: { model: 'Users', key: 'id' },
        },
        expiresIn: {
          type: 'timestamp',
          allowNull: false,
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
      .then(() =>
        Promise.all([
          qi.addIndex('DirectoryAccesses', ['userId', 'directoryId']),
          qi.addIndex('DirectoryAccesses', ['createdBy', 'directoryId']),
        ])
      )
      .catch(async (e) =>
        qi.dropTable('DirectoryAccess').finally(() => {
          throw e;
        })
      );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable('DirectoryAccesses');
  },
};
