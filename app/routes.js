const { healthCheck } = require('./controllers/healthCheck');
const { signUp, signIn, listUsers } = require('./controllers/users');
const paramsValidator = require('./middlewares/params_validator');
const { emailExists, checkCredentialsAndLoadUser, checkAuthentication } = require('./middlewares/users');
const { signUpSchema, emailSchema, paginationSchema } = require('./schemas/user');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', [paramsValidator.validateSchemaAndFail(signUpSchema), emailExists], signUp);
  app.post(
    '/users/sessions',
    [paramsValidator.validateSchemaAndFail(emailSchema), checkCredentialsAndLoadUser],
    signIn
  );
  app.get(
    '/users',
    [checkAuthentication, paramsValidator.validateSchemaAndFail(paginationSchema)],
    listUsers
  );
};
