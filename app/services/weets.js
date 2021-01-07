const { Weet } = require('../models');
const logger = require('../logger');
const errors = require('../errors');
const errorCatalog = require('../schemas/errors_catalog');

exports.createWeet = weet =>
  Weet.create(weet).catch(error => {
    logger.error('Error while trying to save weet in DB.', error.message);
    throw errors.databaseError(errorCatalog.USER_NOT_EXIST_ERROR);
  });

exports.findById = id =>
  Weet.findByPk(id).catch(error => {
    logger.error('Error while trying to get weet by ID.', error.message);
    throw errors.databaseError(error.message);
  });
