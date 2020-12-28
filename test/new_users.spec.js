const supertest = require('supertest');
const app = require('../app');
const userService = require('../app/services/users');

const request = supertest(app);

describe('If POST /users with complete data ', () => {
  let response = {};
  let userFound = {};
  const user = {
    email: 'complete.data@wolox.com.ar',
    password: 'hola1234',
    name: 'Martin',
    last_name: 'Acosta'
  };

  beforeAll(async () => {
    response = await request
      .post('/users')
      .send(user)
      .set('Accept', 'application/json');
    userFound = await userService.emailExists(user.email);
  });

  it('receive status 201.', done => {
    expect(response.statusCode).toBe(201);
    done();
  });

  it('receive an empty response.', done => {
    expect(response.body).toEqual({});
    done();
  });

  it('the user was saved in the DB.', done => {
    expect(userFound).toBeTruthy();
    done();
  });
});

describe('If POST /users with an existent email ', () => {
  let response = {};
  let userFound = {};
  const user = {
    email: 'existent.email@wolox.com.ar',
    password: 'hola1234',
    name: 'Martin',
    last_name: 'Acosta'
  };

  beforeAll(async () => {
    await request
      .post('/users')
      .send(user)
      .set('Accept', 'application/json');
    userFound = await userService.emailExists(user.email);
    response = await request
      .post('/users')
      .send(user)
      .set('Accept', 'application/json');
  });

  it('the user already exists in the DB.', done => {
    expect(userFound).toBeTruthy();
    done();
  });

  it('receive status 400', done => {
    expect(response.status).toBe(400);
    done();
  });

  it('receive an unique_email_error code', done => {
    expect(response.body.internal_code).toBe('unique_email_error');
    done();
  });

  it("receive an 'Email already in use.' message", done => {
    expect(response.body.message).toBe('Email already in use.');
    done();
  });
});

describe('If POST /users with a short password', () => {
  let response = {};
  let userFound = {};
  const user = {
    email: 'short.password@wolox.com.ar',
    password: 'hola',
    name: 'Martin',
    last_name: 'Acosta'
  };

  beforeAll(async () => {
    response = await request
      .post('/users')
      .send(user)
      .set('Accept', 'application/json');
    userFound = await userService.emailExists(user.email);
  });

  it('receive status 400', done => {
    expect(response.status).toBe(400);
    done();
  });

  it('receive an invalid_params_error code', done => {
    expect(response.body.internal_code).toBe('invalid_params_error');
    done();
  });

  it("receive an 'Invalid password.' message", done => {
    expect(response.body.message).toBe('Invalid password.');
    done();
  });

  it('the user was not saved in the DB.', done => {
    expect(userFound).toBeFalsy();
    done();
  });
});

describe('If POST /users with non alphanumeric password', () => {
  let response = {};
  let userFound = {};
  const user = {
    email: 'short.password@wolox.com.ar',
    password: 'hola1234@',
    name: 'Martin',
    last_name: 'Acosta'
  };

  beforeAll(async () => {
    response = await request
      .post('/users')
      .send(user)
      .set('Accept', 'application/json');
    userFound = await userService.emailExists(user.email);
  });

  it('receive status 400', done => {
    expect(response.status).toBe(400);
    done();
  });

  it('receive an invalid_params_error code', done => {
    expect(response.body.internal_code).toBe('invalid_params_error');
    done();
  });

  it("receive an 'Invalid password.' message", done => {
    expect(response.body.message).toBe('Invalid password.');
    done();
  });

  it('the user was not saved in the DB.', done => {
    expect(userFound).toBeFalsy();
    done();
  });
});

describe('If POST /users without email, password, name and last_name', () => {
  let response = {};
  const user = {};

  beforeAll(async () => {
    response = await request
      .post('/users')
      .send(user)
      .set('Accept', 'application/json');
  });

  it('receive status 400', done => {
    expect(response.status).toBe(400);
    done();
  });

  it('receive an invalid_params_error code', done => {
    expect(response.body.internal_code).toBe('invalid_params_error');
    done();
  });

  it("receive an 'Something went wrong with params.' message", done => {
    expect(response.body.message).toBe('Something went wrong with params.');
    done();
  });
});
