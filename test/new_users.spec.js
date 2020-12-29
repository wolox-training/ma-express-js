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

  it('receive status 201.', () => {
    expect(response.statusCode).toBe(201);
  });

  it('receive an empty response.', () => {
    expect(response.body).toEqual({});
  });

  it('the user was saved in the DB.', () => {
    expect(userFound).toBeTruthy();
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

  it('the user already exists in the DB.', () => {
    expect(userFound).toBeTruthy();
  });

  it('receive status 400', () => {
    expect(response.status).toBe(400);
  });

  it('receive an unique_email_error code', () => {
    expect(response.body.internal_code).toBe('unique_email_error');
  });

  it("receive an 'Email already in use.' message", () => {
    expect(response.body.message).toBe('Email already in use.');
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

  it('receive status 400', () => {
    expect(response.status).toBe(400);
  });

  it('receive an invalid_params_error code', () => {
    expect(response.body.internal_code).toBe('invalid_params_error');
  });

  it("receive an 'Invalid password.' message", () => {
    expect(response.body.message).toBe('Invalid password.');
  });

  it('the user was not saved in the DB.', () => {
    expect(userFound).toBeFalsy();
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

  it('receive status 400', () => {
    expect(response.status).toBe(400);
  });

  it('receive an invalid_params_error code', () => {
    expect(response.body.internal_code).toBe('invalid_params_error');
  });

  it("receive an 'Invalid password.' message", () => {
    expect(response.body.message).toBe('Invalid password.');
  });

  it('the user was not saved in the DB.', () => {
    expect(userFound).toBeFalsy();
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

  it('receive status 400', () => {
    expect(response.status).toBe(400);
  });

  it('receive an invalid_params_error code', () => {
    expect(response.body.internal_code).toBe('invalid_params_error');
  });

  it("receive an 'Something went wrong with params.' message", () => {
    expect(response.body.message).toBe('Something went wrong with params.');
  });
});
