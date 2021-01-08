const { Calification } = require('../models');
const logger = require('../logger');
const errors = require('../errors');
const errorCatalog = require('../schemas/errors_catalog');

exports.createCalification = calification =>
  Calification.create(calification).catch(error => {
    logger.error('Error while trying to save calification in DB.', error.message);
    throw errors.databaseError(errorCatalog.CALIFICATION_ERROR);
  });
