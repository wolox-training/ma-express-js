const { healthCheck } = require('./controllers/healthCheck');
const { signUp, signIn, listUsers, invalidateSessions } = require('./controllers/users');
const { createWeet, listWeets, rateWeet } = require('./controllers/weets');
const paramsValidator = require('./middlewares/params_validator');
const {
  emailExists,
  checkCredentialsAndLoadUser,
  checkAuthentication,
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
    [checkAuthentication, paramsValidator.validateSchemaAndFail(paginationSchema)],
    listUsers
  );
  app.post(
    '/admin/users',
    [paramsValidator.validateSchemaAndFail(signUpSchema), checkAuthentication, checkAdmin, emailExists(true)],
    signUp(true)
  );
  app.post('/weets', [checkAuthentication], createWeet);
  app.get(
    '/weets',
    [checkAuthentication, paramsValidator.validateSchemaAndFail(paginationSchema)],
    listWeets
  );
  app.post(
    '/weets/:id/ratings',
    [checkAuthentication, paramsValidator.validateSchemaAndFail(ratingSchema)],
    rateWeet
  );
  app.post('/users/sessions/invalidate_all', [checkAuthentication], invalidateSessions);
};
