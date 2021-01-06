const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const { generateToken } = require('../services/sessions_manager');
const { serializeUsers } = require('../serializers/users');

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

exports.signUp = isAdmin => async (req, res, next) => {
  try {
    const { email, password, name, last_name: lastName } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = {
      email,
      password: hashedPassword,
      name,
      lastName,
      isAdmin
    };
    if (req.user) await userService.upgradeUser(req.user);
    else await userService.createUser(user);

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
    return res.status(200).json(serializeUsers(rawListUsers, page, limit));
  } catch (error) {
    return next(error);
  }
};
