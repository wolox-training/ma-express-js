const bcrypt = require('bcryptjs');
const errors = require('../errors');
const userService = require('../services/users');
const errorsCatalog = require('../schemas/errors_catalog');

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

exports.signUp = async (req, res, next) => {
  try {
    const { email, password, name, last_name: lastName } = req.body;

    const emailExists = await userService.emailExists(req.body.email);
    if (emailExists) throw errors.uniqueEmailError(errorsCatalog.UNIQUE_EMAIL_ERROR);

    const hashedPassword = await hashPassword(password);
    await userService.create(email, hashedPassword, name, lastName);

    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};
