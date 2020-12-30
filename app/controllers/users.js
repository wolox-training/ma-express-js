const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
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

exports.signIn = (req, res, next) => {
  try {
    const { user } = res.locals;

    const payload = {
      id: user.id,
      email: user.email
    };
    const secret = 'hola1234';
    const token = jwt.encode(payload, secret);

    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
};
