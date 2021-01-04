const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const { generateToken } = require('../services/sessions_manager');
const { serializeUsers } = require('../serializers/users');

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
    const { rawListUsers, page, limit } = await userService.listUsers(req.query.page, req.query.limit);
    const listUsers = serializeUsers(rawListUsers, page, limit);
    return res.status(200).json(listUsers);
  } catch (error) {
    return next(error);
  }
};
