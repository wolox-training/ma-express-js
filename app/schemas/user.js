const { isAlphanumeric } = require('validator');
const errorsCatalog = require('./errors_catalog');

exports.emailSchema = {
  email: {
    in: ['body'],
    exists: true,
    isEmail: true,
    custom: {
      options: value => value && value.length > 13 && value.substring(value.length - 13) === '@wolox.com.ar'
    },
    trim: true,
    errorMessage: errorsCatalog.EMAIL_ERROR
  }
};

exports.signUpSchema = {
  ...exports.emailSchema,
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

exports.paginationSchema = {
  page: {
    in: ['query'],
    isInt: {
      options: { min: 1 }
    },
    toInt: true,
    optional: { options: { nullable: true } },
    errorMessage: errorsCatalog.PAGINATION_ERROR
  },
  limit: {
    in: ['query'],
    isInt: {
      options: { min: 1 }
    },
    toInt: true,
    optional: { options: { nullable: true } },
    errorMessage: errorsCatalog.PAGINATION_ERROR
  }
};

exports.ratingSchema = {
  rating: {
    in: ['body'],
    isIn: {
      options: [['1', '-1']]
    },
    toInt: true,
    errorMessage: errorsCatalog.RATING_ERROR
  }
};
