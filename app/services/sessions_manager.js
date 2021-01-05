const jwt = require('jwt-simple');
const moment = require('moment');
const { secret, expirationDays } = require('../../config').common.session;

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
