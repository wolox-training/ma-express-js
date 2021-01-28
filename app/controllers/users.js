const bcrypt = require('bcryptjs');
const userService = require('../services/users');
const emailService = require('../services/emails');
const { removeSessions } = require('../services/sessions_manager');
const { generateToken, sessionRegister } = require('../services/sessions_manager');
const { serializeUsers } = require('../serializers/users');
const { pagination } = require('../mappers/paginations');

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
    await emailService.sendWelcomeEmail(user);
    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const { user } = req;
    const responseWithToken = generateToken(user);
    const session = {
      token: responseWithToken.token,
      expiresIn: responseWithToken.exp,
      userId: user.id
    };
    await sessionRegister(session);
    return res.status(200).json(responseWithToken);
  } catch (error) {
    return next(error);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { page, limit } = pagination(req);
    const rawListUsers = await userService.listUsers(page, limit);
    return res.status(200).json(serializeUsers(rawListUsers, page, limit));
  } catch (error) {
    return next(error);
  }
};

exports.invalidateSessions = async (req, res, next) => {
  try {
    await removeSessions(req.userId);
    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
};
