const { healthCheck } = require('./controllers/healthCheck');
const { signUp, signIn } = require('./controllers/users');
const paramsValidator = require('./middlewares/params_validator');
// const { createUserSchema } = require('./schemas/user');
const { emailSchema, passwordSchema, nameSchema, lastNameSchema } = require('./schemas/user');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post(
    '/users',
    [
      paramsValidator.validateSchemaAndFail(emailSchema),
      paramsValidator.validateSchemaAndFail(passwordSchema),
      paramsValidator.validateSchemaAndFail(nameSchema),
      paramsValidator.validateSchemaAndFail(lastNameSchema)
    ],
    signUp
  );
  app.post(
    '/users/sessions',
    [
      paramsValidator.validateSchemaAndFail(emailSchema),
      paramsValidator.validateSchemaAndFail(passwordSchema)
    ],
    signIn
  );
};
