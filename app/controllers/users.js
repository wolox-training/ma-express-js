const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const errors = require('../errors');

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

exports.signUp = async (req, res, next) => {
  try {
    const { email, password, name, lastName } = req.body;

    const emailExists = await userService.emailExists(req.body.email);
    if (emailExists) throw errors.uniqueEmailError('Email already in use.');

    const hashedPassword = await hashPassword(password);
    await userService.create(email, hashedPassword, name, lastName);

    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};
