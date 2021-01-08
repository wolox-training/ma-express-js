'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'position', {
      type: Sequelize.STRING,
      defaultValue: 'developer'
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('users', 'position', {
      type: Sequelize.STRING,
      defaultValue: 'developer'
    })
};
