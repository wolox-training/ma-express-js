const errors = require('../errors');

const passwordValidation = password => {
  const characters = /^[a-z0-9]+$/i;
  return password.length > 7 && characters.test(password);
};

const emailValidation = email => email.length > 13 && email.substring(email.length - 13) === '@wolox.com.ar';

exports.signUpValidation = (req, res, next) => {
  try {
    const userValid = req.body.email && req.body.password && req.body.name && req.body.last_name;
    if (!userValid) throw errors.invalidParamsError('Something went wrong with params.');

    req.body.email = req.body.email.trim();
    req.body.lastName = req.body.last_name;

    const validEmail = emailValidation(req.body.email);
    if (!validEmail) throw errors.invalidParamsError('Invalid email.');

    const validPass = passwordValidation(req.body.password);
    if (!validPass) throw errors.invalidParamsError('Invalid password.');

    return next();
  } catch (error) {
    return next(error);
  }
};
