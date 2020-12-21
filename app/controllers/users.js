// const User = require('../models/')

exports.register = async (req, res) => {
  const { email, password, name, last_name } = req.body;
  // Verifico que el request contenga todos los campos
  const userValid = email && password && name && last_name ? true : false;
  if (!userValid) res.send('Missing fields.');

  // Verifico que el mail sea válido
  const validEmail = emailValidation(email);
  if (!validEmail) res.send('Invalid email');

  // Verifico que el email no exista previamente
  // const emailExists = await Sequelize.findOne({ where: { email: email } });
  // if (!emailExists === null) res.send('Email already exists.');
  
  // Verifico la longitud y composición de la contraseña
  const validPass = passwordLength(password);
  if (!validPass) res.send('Invalid password');
  
  res.send(userValid);
};

/**
 * Verifica la validez de la contraseña (alfanumérica > 7)
 * @param {String} password 
 */
const passwordLength = password => {
  var caracteres = /^[a-z0-9]+$/i;
  var alfanum = caracteres.test(password);
  const length = password.length > 7 ? true : false;
  const valid = alfanum && length;
  return valid;
}

/**
 * Verifica la validez y el dominio del email
 * @param {String} email 
 */
const emailValidation = email => {
  const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const emailValid = email.includes('@wolox.com.ar') ? true : false;
  const valid = emailRegex && emailValid;
  return valid;
}