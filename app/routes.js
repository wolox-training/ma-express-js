const { healthCheck } = require('./controllers/healthCheck');
const { signUp } = require('./controllers/users');
const { signUpValidation } = require('./middlewares/signup_validation');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', [signUpValidation], signUp);
};
