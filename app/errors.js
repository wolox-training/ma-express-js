const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DATABASE_ERROR = 'database_error';
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

exports.INVALID_PARAMS_ERROR = 'invalid_params_error';
exports.invalidParamsError = message => internalError(message, exports.INVALID_PARAMS_ERROR);

exports.UNIQUE_EMAIL_ERROR = 'unique_email_error';
exports.uniqueEmailError = message => internalError(message, exports.UNIQUE_EMAIL_ERROR);

exports.UNREGISTERED_EMAIL_ERROR = 'unregistered_email_error';
exports.unregisteredEmailError = message => internalError(message, exports.UNREGISTERED_EMAIL_ERROR);

exports.CREDENTIALS_ERROR = 'credentials_error';
exports.credentialsError = message => internalError(message, exports.CREDENTIALS_ERROR);
