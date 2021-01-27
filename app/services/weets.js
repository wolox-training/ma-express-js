const { Op } = require('sequelize');
const moment = require('moment');
const { Weet, sequelize } = require('../models');
const logger = require('../logger');
const errors = require('../errors');
const errorCatalog = require('../schemas/errors_catalog');

const getDates = () => {
  const today = moment().format();
  const yesterday = moment()
    .subtract(1, 'days')
    .format();
  return { yesterday, today };
};

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

exports.listWeets = async (page, limit) => {
  const offset = (page - 1) * limit;
  const rawListWeets = await Weet.findAll({ offset, limit }).catch(error => {
    logger.error('Error while trying to get weets', error.message);
    throw errors.databaseError(error.message);
  });
  return rawListWeets;
};

exports.wittererOfTheDay = async () => {
  const { yesterday, today } = getDates();
  const maxWitterer = await Weet.findOne({
    attributes: ['creator_id', [sequelize.fn('COUNT', sequelize.col('id')), 'weets_quantity']],
    group: ['creator_id'],
    where: {
      created_at: {
        [Op.between]: [yesterday, today]
      }
    },
    order: [[sequelize.literal('weets_quantity'), 'DESC']]
  }).catch(error => {
    logger.error('Error while trying to get the witterer of the day', error.message);
    throw errors.databaseError(error.message);
  });
  if (!maxWitterer) return false;
  return {
    ...maxWitterer.dataValues,
    yesterday,
    today
  };
};
