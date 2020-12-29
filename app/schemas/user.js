const { isAlphanumeric } = require('validator');
const errorsCatalog = require('./errors_catalog');

exports.emailSchema = {
  email: {
    in: ['body'],
    isEmail: {
      bail: true
    },
    custom: {
      options: value => value && value.length > 13 && value.substring(value.length - 13) === '@wolox.com.ar'
    },
    trim: true,
    errorMessage: errorsCatalog.EMAIL_ERROR
  }
};

exports.passwordSchema = {
  password: {
    in: ['body'],
    isLength: {
      options: { min: 8 }
    },
    custom: {
      options: value => value && isAlphanumeric(value)
    },
    errorMessage: errorsCatalog.PASSWORD_ERROR
  }
};

exports.nameSchema = {
  name: {
    in: ['body'],
    exists: true,
    errorMessage: errorsCatalog.NAME_ERROR
  }
};

exports.lastNameSchema = {
  last_name: {
    in: ['body'],
    exists: true,
    errorMessage: errorsCatalog.LAST_NAME_ERROR
  }
};

exports.emailSignInSchema = {
  email: {
    in: ['body'],
    isEmail: {
      bail: true
    },
    custom: {
      options: value => value && value.length > 13 && value.substring(value.length - 13) === '@wolox.com.ar'
    },
    trim: true,
    errorMessage: errorsCatalog.EMAIL_ERROR
  }
};
