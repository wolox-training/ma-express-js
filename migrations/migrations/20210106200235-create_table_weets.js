'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('weets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
            key: 'id'
          }
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable('weets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
            key: 'id'
          }
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    })
};
