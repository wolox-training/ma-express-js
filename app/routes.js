// const controller = require('./controllers/controller');
const { healthCheck } = require('./controllers/healthCheck');
const { register } = require('./controllers/users');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', [], register);
  // app.get('/endpoint/get/path', [], controller.methodGET);
  // app.put('/endpoint/put/path', [], controller.methodPUT);
  // app.post('/endpoint/post/path', [], controller.methodPOST);
};
