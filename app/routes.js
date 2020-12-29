const { healthCheck } = require('./controllers/healthCheck');
const { signUp, signIn } = require('./controllers/users');
const paramsValidator = require('./middlewares/params_validator');
const { emailExists, emailRegistered } = require('./middlewares/users');
const { emailSchema, passwordSchema, nameSchema, lastNameSchema } = require('./schemas/user');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post(
    '/users',
    [
      paramsValidator.validateSchemaAndFail(emailSchema),
      paramsValidator.validateSchemaAndFail(passwordSchema),
      paramsValidator.validateSchemaAndFail(nameSchema),
      paramsValidator.validateSchemaAndFail(lastNameSchema),
      emailExists
    ],
    signUp
  );
  app.post(
    '/users/sessions',
    [
      paramsValidator.validateSchemaAndFail(emailSchema),
      paramsValidator.validateSchemaAndFail(passwordSchema),
      emailRegistered
    ],
    signIn
  );
};
