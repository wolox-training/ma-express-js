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

exports.listUsers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const rawListUsers = await User.findAll({ offset, limit }).catch(error => {
    logger.error('Error while trying to get users', error.message);
    throw errors.databaseError(error.message);
  });
  return { rawListUsers, page, limit };
};

exports.upgradeUser = async user => {
  user.isAdmin = true;
  await user.save();
};

exports.userIdIsAdmin = id =>
  User.findByPk(id).catch(error => {
    logger.error('Error while trying to get user by email', error.message);
    throw errors.databaseError(error.message);
  });
