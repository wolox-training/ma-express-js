const { User } = require('../models');
const logger = require('../logger');
const errors = require('../errors');

exports.emailExists = email =>
  User.findOne({ where: { email } }).catch(error => {
    logger.error('Error while trying to get user by email', error.message);
    throw errors.databaseError(error.message);
  });

exports.create = (email, password, name, lastName) =>
  User.create({ email, password, name, lastName }).catch(error => {
    logger.error('Error while trying to create an user', error.message);
    throw errors.databaseError(error.message);
  });
