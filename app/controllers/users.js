const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = require('../models/user.js');
const errors = require('../middlewares/errors');

// Verifica la validez de la contraseña (alfanumérica > 7)
const passwordLength = password => {
  const characters = /^[a-z0-9]+$/i;
  const alfanumeric = characters.test(password);
  const isValid = password.length > 7 && alfanumeric;
  return isValid;
};

// Verifica la validez y el dominio del email
const emailValidation = email => {
  const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  const emailValid = email.includes('@wolox.com.ar');
  const isValid = emailRegex && emailValid;
  return isValid;
};

// Hashea el password mediante bcrypt
const hashPassword = password => {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return Promise.reject(errors.hashError(err));
    bcrypt.hash(password, salt, (error, hash) => {
      if (error) return Promise.reject(errors.hashError(error));
      return hash;
    });
    return false;
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, last_name } = req.body;
    // Verifico que el request contenga todos los campos
    const userValid = email && password && name && last_name;
    if (!userValid) res.send('Missing fields.');
    const newUser = User.build({ email, password, name, last_name });

    // Verifico que el mail sea válido
    const validEmail = emailValidation(newUser.email);
    if (!validEmail) res.send('Invalid email');

    // Verifico que el email no exista previamente
    const emailExists = await User.findOne({
      where: {
        email: {
          [Op.eq]: newUser.email
        }
      }
    });
    if (emailExists) res.send('Email already exists.');

    // Verifico la longitud y composición de la contraseña
    const validPass = passwordLength(newUser.password);
    if (!validPass) res.send('Invalid password');
    const hashedPassword = hashPassword(newUser.password);

    // res.send(userValid);
    return res.send({ user: userValid, pass: hashedPassword });
  } catch (error) {
    return next(errors.notFound('User not found'));
  }
};
