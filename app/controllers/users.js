const bcrypt = require('bcryptjs');
const userService = require('../services/users');

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

exports.signIn = async (req, res, next) => {
  try {
    console.log('EL REQUEST: ', req.body);
    const { email, password } = req.body;

    const emailExists = await userService.emailExists(email);
    if (!emailExists) throw errors.unregisteredEmailError(errorsCatalog.UNREGISTERED_EMAIL_ERROR);

    console.log('LOS DATOS RESCATADOS: ', emailExists.dataValues, password);

    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
};
