const bcrypt = require('bcryptjs');

const { User } = require('../models');
const errors = require('../errors');

const passwordLength = password => {
  const characters = /^[a-z0-9]+$/i;
  return password.length > 7 && characters.test(password);
};

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

const emailValidation = email => email.length > 13 && email.substring(email.length - 13) === '@wolox.com.ar';

exports.register = async (req, res, next) => {
  const { email: dirtEmail, password, name, last_name: lastName } = req.body;
  const email = dirtEmail.trim();
  try {
    const userValid = email && password && name && lastName;
    if (!userValid) throw errors.createUserError('Missing fields.');

    const validEmail = emailValidation(email);
    if (!validEmail) throw errors.createUserError('Invalid email.');

    const validPass = passwordLength(password);
    if (!validPass) throw errors.createUserError('Invalid password.');

    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) throw errors.createUserError('Email already exists.');

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ email, password: hashedPassword, name, lastName });
    if (!newUser) throw errors.databaseError('DB error.');

    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};
