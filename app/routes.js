const { healthCheck } = require('./controllers/healthCheck');
const { signUp, signIn, listUsers } = require('./controllers/users');
const paramsValidator = require('./middlewares/params_validator');
const {
  emailExists,
  checkCredentialsAndLoadUser,
  checkAuthentication,
  checkAdmin
} = require('./middlewares/users');
const { signUpSchema, emailSchema, paginationSchema } = require('./schemas/user');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post(
    '/users',
    [paramsValidator.validateSchemaAndFail(signUpSchema), emailExists(false)],
    signUp(false)
  );
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
  app.post(
    '/admin/users',
    [paramsValidator.validateSchemaAndFail(signUpSchema), checkAuthentication, checkAdmin, emailExists(true)],
    signUp(true)
  );
};
