const { healthCheck } = require('./controllers/healthCheck');
const { signUp } = require('./controllers/users');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', signUp);
};
