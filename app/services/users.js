const { User } = require('../models');
const logger = require('../logger');
const errors = require('../errors');

exports.emailExists = email =>
  User.findOne({ where: { email } }).catch(error => {
    logger.error('Error while trying to get user by email', error.message);
    throw errors.databaseError(error.message);
  });

exports.createUser = user =>
  User.create(user).catch(error => {
    logger.error('Error while trying to create an user', error.message);
    throw errors.databaseError(error.message);
  });

exports.listUsers = (offset, limit) =>
  User.findAll({ offset, limit }).catch(error => {
    logger.error('Error while trying to get users', error.message);
    throw errors.databaseError(error.message);
  });

exports.upgradeUser = user => {
  user.isAdmin = true;
  user.save();
};
