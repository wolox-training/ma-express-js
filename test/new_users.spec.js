const users = require('../app/controllers/users');
const logger = require('../app/logger');

/**
 * BACKLOG
 * I can create a new user with email, password, name and last name
 * I can't create a new user with an existent email
 * I can't create a new user with a password of less than 8 characters
 * I can't create a new user without email, password, name and last name
 */

describe('I can create a new user ', () => {
  test('with email, password, name and last name', async done => {
    const req = {
      body: {
        email: 'z@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      }
    };
    console.log(req);
    const response = await users.register(req);
    logger.info('hola 3');
    logger.info(req);
    logger.info(response);
    console.log(response);
    expect(response).toEqual({ email: 'z@wolox.com.ar' });
    // expect(response).toEqual({ error: 'Email already exists' });
    done();
  });
});
