const { healthCheck } = require('./controllers/healthCheck');
const { signUp, signIn, listUsers, invalidateSessions } = require('./controllers/users');
const { createWeet, listWeets, rateWeet } = require('./controllers/weets');
const paramsValidator = require('./middlewares/params_validator');
const {
  emailExists,
  checkCredentialsAndLoadUser,
  checkHeader,
  checkAuthentication,
  checkSession,
  checkAdmin
} = require('./middlewares/users');
const { signUpSchema, emailSchema, paginationSchema, ratingSchema } = require('./schemas/user');

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
    [checkHeader, checkSession, checkAuthentication, paramsValidator.validateSchemaAndFail(paginationSchema)],
    listUsers
  );
  app.post(
    '/admin/users',
    [
      paramsValidator.validateSchemaAndFail(signUpSchema),
      checkHeader,
      checkSession,
      checkAuthentication,
      checkAdmin,
      emailExists(true)
    ],
    signUp(true)
  );
  app.post('/weets', [checkHeader, checkSession, checkAuthentication], createWeet);
  app.get(
    '/weets',
    [checkHeader, checkSession, checkAuthentication, paramsValidator.validateSchemaAndFail(paginationSchema)],
    listWeets
  );
  app.post(
    '/weets/:id/ratings',
    [checkHeader, checkSession, checkAuthentication, paramsValidator.validateSchemaAndFail(ratingSchema)],
    rateWeet
  );
  app.post(
    '/users/sessions/invalidate_all',
    [checkHeader, checkSession, checkAuthentication],
    invalidateSessions
  );
};
