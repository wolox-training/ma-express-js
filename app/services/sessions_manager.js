const jwt = require('jwt-simple');
const moment = require('moment');

exports.encode = payload => jwt.encode(payload, process.env.SECRET_KEY);

exports.decode = token => jwt.decode(token, process.env.SECRET_KEY);

const expirationDate = () => moment().add(process.env.EXPIRATION_DAYS, 'days');

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
