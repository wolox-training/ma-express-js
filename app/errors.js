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

exports.CREDENTIALS_ERROR = 'credentials_error';
exports.credentialsError = message => internalError(message, exports.CREDENTIALS_ERROR);

exports.AUTHORIZATION_ERROR = 'authorization_error';
exports.authorizationError = message => internalError(message, exports.AUTHORIZATION_ERROR);

exports.TOKEN_EXPIRATION_ERROR = 'token_expiration_error';
exports.tokenExpirationError = message => internalError(message, exports.TOKEN_EXPIRATION_ERROR);

exports.FORBIDDEN_ERROR = 'forbidden_error';
exports.forbiddenError = message => internalError(message, exports.FORBIDDEN_ERROR);

exports.EXTERNAL_API_ERROR = 'external_api_error';
exports.externalApiError = message => internalError(message, exports.EXTERNAL_API_ERROR);
