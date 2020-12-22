const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

/**
 * BACKLOG
 * I can create a new user with email, password, name and last name
 * I can't create a new user with an existent email
 * I can't create a new user with a password of less than 8 characters
 * I can't create a new user without email, password, name and last name
 * ------------------------------------------
 * If POST /users with complete data, receive an empty response with status 204
 * If POST /users with an existent email, receive a create_user_error
 * If POST /users with a short password, receive a create_user_error
 * If POST /users without email, password, name and last_name, receive a create_user_error
 */

describe('If POST /users', () => {
  it('with complete data, receive an empty response with status 204', done => {
    request
      .post('/users')
      .send({
        email: 'q@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual({ email: 'q@wolox.com.ar' });
        // expect(res.body).toBeNull();
        return done();
      });
  });

  it('with an existent email, receive a create_user_error', done => {
    request.post('/users').send({
      email: 'q@wolox.com.ar',
      password: 'hola1234',
      name: 'Martin',
      last_name: 'Acosta'
    });
    request
      .post('/users')
      .send({
        email: 'q@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual({ email: 'q@wolox.com.ar' });
        // expect(res.body).toBeNull();
        return done();
      });
  });

  it('with a short password, receive a create_user_error', done => {
    request
      .post('/users')
      .send({
        email: 'q@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual({ email: 'q@wolox.com.ar' });
        // expect(res.body).toBeNull();
        return done();
      });
  });

  it('without email, password, name and last_name, receive a create_user_error', done => {
    request
      .post('/users')
      .send({
        email: 'q@wolox.com.ar',
        password: 'hola1234',
        name: 'Martin',
        last_name: 'Acosta'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toEqual({ email: 'q@wolox.com.ar' });
        // expect(res.body).toBeNull();
        return done();
      });
  });
});
