// const controller = require('./controllers/controller');
const { healthCheck } = require('./controllers/healthCheck');
const { register } = require('./controllers/users');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', register);
};
