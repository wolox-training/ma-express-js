const { Weet } = require('../models');
const logger = require('../logger');
const errors = require('../errors');

exports.createWeet = weet => {
  console.log('WEET EN SERVICIO: ', weet);
  Weet.create(weet).catch(error => {
    logger.error('Error while trying to create a weet', error.message);
    throw errors.databaseError(error.message);
  });
};

exports.findById = id =>
  Weet.findByPk(id).catch(error => {
    logger.error('Error while trying to get weet by ID', error.message);
    throw errors.databaseError(error.message);
  });
