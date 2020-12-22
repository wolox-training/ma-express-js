const bcrypt = require('bcryptjs');

const { User } = require('../models');
const errors = require('../middlewares/errors');
const logger = require('../logger');

// Verifica la validez de la contraseña (alfanumérica > 7)
const passwordLength = password => {
  const characters = /^[a-z0-9]+$/i;
  const alfanumeric = characters.test(password);
  const isValid = password.length > 7 && alfanumeric;
  return isValid;
};

// Hashea el password mediante bcrypt
const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

// Verifica la validez y el dominio del email
const emailValidation = email => {
  const stringLength = email.length;
  const testLength = stringLength > 13;
  const testDomain = email.substring(stringLength - 13) === '@wolox.com.ar';
  const isValid = testLength && testDomain;
  return isValid;
};

const mapRequest = body => {
  const lastName = body.last_name;
  return lastName;
};

exports.register = async (req, res, next) => {
  const { email, password, name } = req.body;
  const lastName = mapRequest(req.body);
  try {
    // Verifico que el request contenga todos los campos
    const userValid = email && password && name && lastName;
    if (!userValid) res.json({ error: 'Missing fields.' });

    // Verifico que el mail sea válido
    const validEmail = emailValidation(email);
    if (!validEmail) res.json({ error: 'Invalid email.' });

    // Verifico que el email no exista previamente
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) return res.send({ error: 'Email already exists.' });

    // Verifico la longitud y composición de la contraseña
    const validPass = passwordLength(password);
    if (!validPass) return res.json({ error: 'Invalid password.' });
    const hashedPassword = await hashPassword(password);

    // Creo el nuevo usuario
    const newUser = await User.create({ email, password: hashedPassword, name, lastName });
    if (!newUser) return res.json({ error: 'DB error.' });

    return res.json({ email });
  } catch (error) {
    logger.error(error);
    return next(errors.DEFAULT_ERROR);
  }
};
