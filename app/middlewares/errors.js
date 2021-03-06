const errors = require('../errors');

const DEFAULT_STATUS_CODE = 500;

const statusCodes = {
  [errors.DATABASE_ERROR]: 503,
  [errors.DEFAULT_ERROR]: 500,
  [errors.INVALID_PARAMS_ERROR]: 400,
  [errors.UNIQUE_EMAIL_ERROR]: 400,
  [errors.CREDENTIALS_ERROR]: 401,
  [errors.AUTHORIZATION_ERROR]: 401,
  [errors.TOKEN_EXPIRATION_ERROR]: 401,
  [errors.FORBIDDEN_ERROR]: 403,
  [errors.JOKE_API_ERROR]: 503
};

exports.handle = (error, req, res, next) => {
  if (error.internalCode) res.status(statusCodes[error.internalCode] || DEFAULT_STATUS_CODE);
  else {
    // Unrecognized error, notifying it to rollbar.
    next(error);
    res.status(DEFAULT_STATUS_CODE);
  }
  return res.send({ message: error.message, internal_code: error.internalCode });
};
