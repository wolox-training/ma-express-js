const supertest = require('supertest');
const app = require('../app');
const userService = require('../app/services/users');
const errorsCatalog = require('../app/schemas/errors_catalog');
const errors = require('../app/errors');

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

<<<<<<< HEAD
  it('Receive status 201.', () => expect(response.statusCode).toBe(201));

  it('Receive an empty response.', () => expect(response.body).toEqual({}));

  it('The user was saved in the DB.', () => expect(userFound).toBeTruthy());
=======
  it('receive status 201.', () => {
    expect(response.statusCode).toBe(201);
  });

  it('receive an empty response.', () => {
    expect(response.body).toEqual({});
  });

  it('the user was saved in the DB.', () => {
    expect(userFound).toBeTruthy();
  });
>>>>>>> 0e66055d22331e4ab4c578089691bb27e0babe44
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

<<<<<<< HEAD
  it('The user already exists in the DB.', () => {
    expect(userFound).toBeTruthy();
  });

  it('Receive status 400', () => expect(response.status).toBe(400));

  it(`Receive an ${errors.UNIQUE_EMAIL_ERROR} code`, () =>
    expect(response.body.internal_code).toBe(errors.UNIQUE_EMAIL_ERROR));

  it(`Receive an '${errorsCatalog.UNIQUE_EMAIL_ERROR}' message`, () =>
    expect(response.body.message).toBe(errorsCatalog.UNIQUE_EMAIL_ERROR));
=======
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
>>>>>>> 0e66055d22331e4ab4c578089691bb27e0babe44
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

<<<<<<< HEAD
  it('Receive status 400', () => expect(response.status).toBe(400));

  it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
    expect(response.body.internal_code).toBe(errors.INVALID_PARAMS_ERROR));

  it(`Receive an '${errorsCatalog.PASSWORD_ERROR}' message`, () =>
    expect(response.body.message[0]).toBe(errorsCatalog.PASSWORD_ERROR));

  it('The user was not saved in the DB.', () => expect(userFound).toBeFalsy());
=======
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
>>>>>>> 0e66055d22331e4ab4c578089691bb27e0babe44
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

<<<<<<< HEAD
  it('Receive status 400', () => expect(response.status).toBe(400));

  it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
    expect(response.body.internal_code).toBe(errors.INVALID_PARAMS_ERROR));

  it(`Receive an '${errorsCatalog.PASSWORD_ERROR}' message`, () =>
    expect(response.body.message[0]).toBe(errorsCatalog.PASSWORD_ERROR));

  it('The user was not saved in the DB.', () => expect(userFound).toBeFalsy());
});

describe('If POST /users without email, password, name and last_name', () => {
  const bodyParams = ['email', 'password', 'name', 'last_name'];
  const errorMessageMap = {
    email: [errorsCatalog.EMAIL_ERROR],
    password: [errorsCatalog.PASSWORD_ERROR],
    name: [errorsCatalog.NAME_ERROR],
    last_name: [errorsCatalog.LAST_NAME_ERROR]
  };
  const user = {
    email: 'incomplete.data@wolox.com.ar',
    password: 'hola1234',
    name: 'Martin',
    last_name: 'Acosta'
  };

  bodyParams.forEach(param => {
    describe(`When ${param} is not sent`, () => {
      let response = {};
      let userFound = {};
      const createIncompleteUser = { ...user };
      delete createIncompleteUser[param];
      beforeAll(async () => {
        response = await request
          .post('/users')
          .send(createIncompleteUser)
          .set('Accept', 'application/json');
        userFound = await userService.emailExists(user.email);
      });
      it('Checks error structure given by middleware', () =>
        expect(Object.keys(response.body)).toEqual(['message', 'internal_code']));
      it('Receive status 400', () => expect(response.status).toBe(400));
      it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.INVALID_PARAMS_ERROR));
      it(`Receive an '${errorMessageMap[param]}' message`, () =>
        expect(response.body.message).toEqual(errorMessageMap[param]));
      it('The user was not saved in the DB.', () => expect(userFound).toBeFalsy());
    });
=======
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
>>>>>>> 0e66055d22331e4ab4c578089691bb27e0babe44
  });
});
