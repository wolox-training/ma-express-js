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

exports.listWeets = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const rawListWeets = await Weet.findAll({ offset, limit }).catch(error => {
    logger.error('Error while trying to get weets', error.message);
    throw errors.databaseError(error.message);
  });
  return { rawListWeets, page, limit };
};
