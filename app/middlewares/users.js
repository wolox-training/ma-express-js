const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const errors = require('../errors');
const errorsCatalog = require('../schemas/errors_catalog');
const sessionsManager = require('../services/sessions_manager');

exports.emailExists = async (req, res, next) => {
  try {
    const emailExists = await userService.emailExists(req.body.email);
    if (emailExists) throw errors.uniqueEmailError(errorsCatalog.UNIQUE_EMAIL_ERROR);
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.checkCredentialsAndLoadUser = (req, res, next) =>
  userService.emailExists(req.body.email).then(user => {
    if (!user) return next(errors.credentialsError(errorsCatalog.CREDENTIALS_ERROR));
    return bcrypt.compare(req.body.password, user.dataValues.password).then(passwordMatch => {
      if (!passwordMatch) return next(errors.credentialsError(errorsCatalog.CREDENTIALS_ERROR));
      req.user = user.dataValues;
      return next();
    });
  });

exports.checkAuthentication = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return next(errors.authorizationError(errorsCatalog.AUTHORIZATION_ERROR));
  const payload = sessionsManager.checkToken(authorization);
  if (!payload) return next(errors.tokenExpirationError(errorsCatalog.TOKEN_EXPIRATION_ERROR));
  return next();
};
