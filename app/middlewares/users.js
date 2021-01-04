const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const errors = require('../errors');
const errorsCatalog = require('../schemas/errors_catalog');
const sessionsManager = require('../services/sessions_manager');

exports.emailExists = isAdmin => (req, res, next) =>
  userService.emailExists(req.body.email).then(user => {
    if (user && !isAdmin) return next(errors.uniqueEmailError(errorsCatalog.UNIQUE_EMAIL_ERROR));
    if (user) req.user = user;
    return next();
  });

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
  const authorized = sessionsManager.checkToken(authorization);
  if (!authorized) return next(errors.authorizationError(errorsCatalog.AUTHORIZATION_ERROR));
  return next();
};
