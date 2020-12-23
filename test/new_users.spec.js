const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('If POST /users', () => {
  it('with complete data, receive an empty response with status 204', async done => {
    await request
      .post('/users')
      .send({
        email: 'complete.data@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect(204);
    done();
  });

  it('with an existent email, receive a create_user_error', async done => {
    await request
      .post('/users')
      .send({
        email: 'existent.email@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect(204);
    await request
      .post('/users')
      .send({
        email: 'existent.email@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect(400, { message: 'Email already in use.', internal_code: 'unique_email_error' });
    done();
  });

  it('with a short password, receive a create_user_error', async done => {
    await request
      .post('/users')
      .send({
        email: 'short.password@wolox.com.ar',
        password: 'hola',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { message: 'Invalid password.', internal_code: 'invalid_params_error' });
    done();
  });

  it('with non alphanumeric password, receive a create_user_error', async done => {
    await request
      .post('/users')
      .send({
        email: 'short.password@wolox.com.ar',
        password: 'hola1234@',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { message: 'Invalid password.', internal_code: 'invalid_params_error' });
    done();
  });

  it('without email, password, name and last_name, receive a create_user_error', async done => {
    await request
      .post('/users')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, { message: 'Something went wrong with params.', internal_code: 'invalid_params_error' });
    done();
  });
});
