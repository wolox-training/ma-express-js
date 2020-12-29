const { isAlphanumeric } = require('validator');
const errorsCatalog = require('./errors_catalog');

exports.createUserSchema = {
  email: {
    in: ['body'],
    exists: true,
    isEmail: true,
    custom: {
      options: value => value && value.length > 13 && value.substring(value.length - 13) === '@wolox.com.ar'
    },
    trim: true,
    errorMessage: errorsCatalog.EMAIL_ERROR
  },
  password: {
    in: ['body'],
    exists: true,
    isLength: {
      options: { min: 8 }
    },
    custom: {
      options: value => value && isAlphanumeric(value)
    },
    errorMessage: errorsCatalog.PASSWORD_ERROR
  },
  name: {
    in: ['body'],
    exists: true,
    errorMessage: errorsCatalog.NAME_ERROR
  },
  last_name: {
    in: ['body'],
    exists: true,
    errorMessage: errorsCatalog.LAST_NAME_ERROR
  }
};
