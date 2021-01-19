const jwt = require('jwt-simple');
const moment = require('moment');
const { Session } = require('../models');
const { secret, expirationDays } = require('../../config').common.session;
const logger = require('../logger');
const errors = require('../errors');

exports.encode = payload => jwt.encode(payload, secret);

exports.decode = token => jwt.decode(token, secret);

const expirationDate = () => moment().add(expirationDays, 'days');

exports.generateToken = user => {
  const newExpirationDate = expirationDate();
  return {
    token: exports.encode({
      id: user.id,
      iss: 'JWT',
      exp: newExpirationDate
    }),
    exp: newExpirationDate
  };
};

exports.checkToken = authString => {
  try {
    const payload = exports.decode(authString.replace(/^Bearer\s+/, ''), secret);
    if (!moment().isBefore(payload.exp)) return false;
    return payload;
  } catch (error) {
    return false;
  }
};

exports.sessionRegister = session =>
  Session.create(session).catch(error => {
    logger.error('Error while trying to save the session', error.message);
    throw errors.databaseError(error.message);
  });

exports.removeSessions = user =>
  Session.destroy({ where: { userId: user } }).catch(error => {
    logger.error('Error while trying to remove sessions', error.message);
    throw errors.databaseError(error.message);
  });
