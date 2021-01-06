const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const errors = require('../errors');
const errorsCatalog = require('../schemas/errors_catalog');
const sessionsManager = require('../services/sessions_manager');

exports.emailExists = isAdmin => (req, res, next) =>
  userService.findByEmail(req.body.email).then(user => {
    if (user && !isAdmin) return next(errors.uniqueEmailError(errorsCatalog.UNIQUE_EMAIL_ERROR));
    if (user) req.user = user;
    return next();
  });

exports.checkCredentialsAndLoadUser = (req, res, next) =>
  userService.findByEmail(req.body.email).then(user => {
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
  req.userId = payload.id;
  return next();
};

exports.checkAdmin = (req, res, next) =>
  userService.findById(req.userId).then(user => {
    if (!user.dataValues.isAdmin) return next(errors.forbiddenError(errorsCatalog.FORBIDDEN_ERROR));
    return next();
  });
