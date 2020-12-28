// const logger = require('../logger');
// const { checkSchema } = require('express-validator');
const errors = require('../errors');
const userService = require('../services/users');

const passwordTest = password => {
  const characters = /^[a-z0-9]+$/i;
  return password.length > 7 && characters.test(password);
};

const emailValidation = email => email.length > 13 && email.substring(email.length - 13) === '@wolox.com.ar';

exports.signUpValidation = async (req, res, next) => {
  try {
    const userValid = req.body.email && req.body.password && req.body.name && req.body.last_name;
    if (!userValid) throw errors.invalidParamsError('Something went wrong with params.');

    req.email = req.email.trim();
    req.lastName = req.last_name;
    const { email, password } = req.body;
    const validEmail = emailValidation(email);
    if (!validEmail) throw errors.invalidParamsError('Invalid email.');

    const validPass = passwordTest(password);
    if (!validPass) throw errors.invalidParamsError('Invalid password.');

    const emailExists = await userService.emailExists(email);
    if (emailExists) throw errors.uniqueEmailError('Email already in use.');
    return next();
  } catch (error) {
    return next(error);
  }
};
