const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const { generateToken } = require('../services/sessions_manager');

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

exports.signUp = async (req, res, next) => {
  try {
    const { email, password, name, last_name: lastName } = req.body;

    const hashedPassword = await hashPassword(password);
    await userService.create(email, hashedPassword, name, lastName);

    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};

exports.signIn = (req, res, next) => {
  try {
    const { user } = req;

    const responseWithToken = generateToken(user);

    return res.status(200).json(responseWithToken);
  } catch (error) {
    return next(error);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { offset, limit } = req.query;

    const listUsers = await userService.listUsers(offset, limit).map(user => ({
      id: user.dataValues.id,
      name: user.dataValues.name,
      lastName: user.dataValues.lastName,
      email: user.dataValues.email
    }));

    return res.status(200).json(listUsers);
  } catch (error) {
    return next(error);
  }
};
