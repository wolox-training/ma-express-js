const { healthCheck } = require('./controllers/healthCheck');
const { signUp, signIn } = require('./controllers/users');
const paramsValidator = require('./middlewares/params_validator');
<<<<<<< HEAD
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
=======
const { emailExists } = require('./middlewares/users');
const { createUserSchema } = require('./schemas/user');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', [paramsValidator.validateSchemaAndFail(createUserSchema), emailExists], signUp);
>>>>>>> a57a456701edbb33c9d267ae1cac03e7dd3e7d14
};
