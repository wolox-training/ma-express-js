const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const errors = require('../errors');
const errorsCatalog = require('../schemas/errors_catalog');

exports.emailExists = async (req, res, next) => {
  try {
    const emailExists = await userService.emailExists(req.body.email);
    if (emailExists) throw errors.uniqueEmailError(errorsCatalog.UNIQUE_EMAIL_ERROR);
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.emailRegistered = async (req, res, next) => {
  try {
    const userFound = await userService.emailExists(req.body.email);
    if (!userFound) throw errors.credentialsError(errorsCatalog.CREDENTIALS_ERROR);

    const passwordMatch = await bcrypt.compare(req.body.password, userFound.dataValues.password);
    if (!passwordMatch) throw errors.credentialsError(errorsCatalog.CREDENTIALS_ERROR);

    res.locals.user = userFound.dataValues;

    return next();
  } catch (error) {
    return next(error);
  }
};
