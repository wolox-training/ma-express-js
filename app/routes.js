const { healthCheck } = require('./controllers/healthCheck');
const { signUp } = require('./controllers/users');
const paramsValidator = require('./middlewares/params_validator');
const { emailExists } = require('./middlewares/users');
const { createUserSchema } = require('./schemas/user');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', [paramsValidator.validateSchemaAndFail(createUserSchema), emailExists], signUp);
};
