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
