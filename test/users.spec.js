/* eslint-disable max-lines */
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const userService = require('../app/services/users');
const sessionsManager = require('../app/services/sessions_manager');
const errorsCatalog = require('../app/schemas/errors_catalog');
const errors = require('../app/errors');

const { create: createUser } = require('./factory/users');

const request = supertest(app);

const postUser = (endpoint, data) =>
  request
    .post(endpoint)
    .send(data)
    .set('Accept', 'application/json');

const getUsers = (endpoint, token) =>
  request
    .get(endpoint)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .set('Accept', 'application/json');

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

describe('/users [POST]', () => {
  describe('with complete data ', () => {
    let response = {};
    let userFound = {};
    const user = {
      email: 'complete.data@wolox.com.ar',
      password: 'hola1234',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      response = await postUser('/users', user);
      userFound = await userService.emailExists(user.email);
    });

    it('Receive status 201.', () => expect(response.statusCode).toBe(201));

    it('Receive an empty response.', () => expect(response.body).toEqual({}));

    it('The user was saved in the DB.', () => expect(userFound).toBeTruthy());
  });

  describe('with an existent email ', () => {
    let response = {};
    let userFound = {};
    const user = {
      email: 'existent.email@wolox.com.ar',
      password: 'hola1234',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      await createUser(user);
      userFound = await userService.emailExists(user.email);
      response = await postUser('/users', user);
    });

    it('The user already exists in the DB.', () => expect(userFound).toBeTruthy());

    it('Receive status 400', () => expect(response.status).toBe(400));

    it(`Receive an ${errors.UNIQUE_EMAIL_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.UNIQUE_EMAIL_ERROR));

    it(`Receive an '${errorsCatalog.UNIQUE_EMAIL_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.UNIQUE_EMAIL_ERROR));
  });

  describe('with a short password', () => {
    let response = {};
    let userFound = {};
    const user = {
      email: 'short.password@wolox.com.ar',
      password: 'hola',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      response = await postUser('/users', user);
      userFound = await userService.emailExists(user.email);
    });

    it('Receive status 400', () => expect(response.status).toBe(400));

    it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.INVALID_PARAMS_ERROR));

    it(`Receive an '${errorsCatalog.PASSWORD_ERROR}' message`, () =>
      expect(response.body.message[0]).toBe(errorsCatalog.PASSWORD_ERROR));

    it('The user was not saved in the DB.', () => expect(userFound).toBeFalsy());
  });

  describe('with non alphanumeric password', () => {
    let response = {};
    let userFound = {};
    const user = {
      email: 'short.password@wolox.com.ar',
      password: 'hola1234@',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      response = await postUser('/users', user);
      userFound = await userService.emailExists(user.email);
    });

    it('Receive status 400', () => expect(response.status).toBe(400));

    it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.INVALID_PARAMS_ERROR));

    it(`Receive an '${errorsCatalog.PASSWORD_ERROR}' message`, () =>
      expect(response.body.message[0]).toBe(errorsCatalog.PASSWORD_ERROR));

    it('The user was not saved in the DB.', () => expect(userFound).toBeFalsy());
  });

  describe('without email, password, name and last_name', () => {
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
          response = await postUser('/users', createIncompleteUser);
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
    });
  });
});

describe('/users/sessions [POST]', () => {
  describe('When user email is not valid', () => {
    let response = {};
    let userFound = {};
    const userInvalid = {
      email: 'user@wolo.com.ar',
      password: 'hola1234'
    };

    beforeAll(async () => {
      response = await postUser('/users/sessions', userInvalid);
      userFound = await userService.emailExists(userInvalid.email);
    });

    it('Checks error structure given by middleware', () =>
      expect(Object.keys(response.body)).toEqual(['message', 'internal_code']));

    it('Receive status 400', () => expect(response.status).toBe(400));

    it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
      expect(response.body.internal_code).toEqual(errors.INVALID_PARAMS_ERROR));

    it(`Receive an '${errorsCatalog.EMAIL_ERROR}' message`, () =>
      expect(response.body.message[0]).toBe(errorsCatalog.EMAIL_ERROR));

    it('The user is not stored in the DB.', () => expect(userFound).toBeFalsy());
  });

  describe('When user is not registered', () => {
    let response = {};
    let userFound = {};
    const user = {
      email: 'user@wolox.com.ar',
      password: 'hola1234'
    };

    beforeAll(async () => {
      response = await postUser('/users/sessions', user);
      userFound = await userService.emailExists(user.email);
    });

    it('Checks error structure given by middleware', () =>
      expect(Object.keys(response.body)).toEqual(['message', 'internal_code']));

    it('Receive status 401', () => expect(response.status).toBe(401));

    it(`Receive an ${errors.CREDENTIALS_ERROR} code`, () =>
      expect(response.body.internal_code).toEqual(errors.CREDENTIALS_ERROR));

    it(`Receive an '${errorsCatalog.CREDENTIALS_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.CREDENTIALS_ERROR));

    it('The user is not stored in the DB.', () => expect(userFound).toBeFalsy());
  });

  describe('When user is registered', () => {
    let response = {};
    let userFound = {};
    const userRegister = {
      email: 'user@wolox.com.ar',
      password: 'hola1234'
    };

    describe('When password not match', () => {
      const userLogin = {
        email: 'user@wolox.com.ar',
        password: 'hola12345'
      };

      beforeAll(async () => {
        userRegister.password = await hashPassword('hola1234');
        await createUser(userRegister);
        response = await postUser('/users/sessions', userLogin);
        userFound = await userService.emailExists(userRegister.email);
      });

      it('The user is stored in the DB.', () => expect(userFound).toBeTruthy());

      it('Receive status 401.', () => expect(response.statusCode).toBe(401));

      it(`Receive an ${errors.CREDENTIALS_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.CREDENTIALS_ERROR));

      it(`Receive an '${errorsCatalog.CREDENTIALS_ERROR}' message`, () =>
        expect(response.body.message).toBe(errorsCatalog.CREDENTIALS_ERROR));
    });

    describe('When password match', () => {
      let payload = {};
      const userLogin = {
        email: 'user@wolox.com.ar',
        password: 'hola1234'
      };

      beforeAll(async () => {
        await createUser(userRegister);
        userFound = await userService.emailExists(userRegister.email);
        response = await postUser('/users/sessions', userLogin);
      });

      it('The user is stored in the DB.', () => expect(userFound).toBeTruthy());

      it('Receive status 200.', () => expect(response.statusCode).toBe(200));

      it('Receive a token.', () => expect(Object.keys(response.body)).toContain('token'));

      it('Receive an expiration date.', () => expect(Object.keys(response.body)).toContain('exp'));

      it('The decoded token should contain id, iss and exp keys', () => {
        payload = sessionsManager.decode(response.body.token);
        expect(Object.keys(payload)).toContain('id', 'iss', 'exp');
      });
    });
  });
});

describe('/users [GET]', () => {
  let token = {};
  beforeAll(async () => {
    const userLogin = {
      email: 'user@wolox.com.ar',
      password: 'hola1234'
    };
    userLogin.password = await hashPassword('hola1234');
    await createUser(userLogin);
    userLogin.password = 'hola1234';
    token = await (await postUser('/users/sessions', userLogin)).body.token;
  });

  describe('When Authorization header is missing', () => {
    let response = {};
    beforeAll(async () => {
      await createUser();
      await createUser();
      await createUser();
      response = await request
        .get('/users?page=1&limit=2')
        .send()
        .set('Accept', 'application/json');
    });

    it('Receive status code 401.', () => expect(response.statusCode).toBe(401));
  });

  describe('When token is expired', () => {
    const expiredToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaXNzIjoiSldUIiwiZXhwIjoiMjAyMS0wMS0wNFQxODowNzozNC4zOThaIn0.--me13YPlNbn-acjhwlNfiMuicEyAopZPLLnP4BAl88';
    let response = {};

    describe('When send page = 1 and limit = 2 as query params', () => {
      beforeAll(async () => (response = await getUsers('/users?page=1&limit=2', expiredToken)));

      it('Receive status code 401.', () => expect(response.statusCode).toBe(401));

      it(`Receive an ${errors.AUTHORIZATION_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.AUTHORIZATION_ERROR));

      it(`Receive an '${errorsCatalog.AUTHORIZATION_ERROR}' message`, () =>
        expect(response.body.message).toBe(errorsCatalog.AUTHORIZATION_ERROR));
    });
  });

  describe('When token is valid', () => {
    let response = {};
    beforeAll(async () => {
      await createUser();
      await createUser();
      await createUser();
    });

    describe('Successful with pagination params', () => {
      beforeAll(async () => (response = await getUsers('/users?page=1&limit=2', token)));

      it('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      it('Response contains page, offset and limit params', () => {
        expect(Object.keys(response.body)).toContain('page', 'offset', 'limit');
      });

      it('Receive 2 users.', () => expect(response.body.page.length).toBe(2));

      it('Receive user ids 1 and 2', () => {
        expect(response.body.page[0].id).toBe(1);
        expect(response.body.page[1].id).toBe(2);
      });
    });

    describe('Successful without pagination params', () => {
      beforeAll(async () => {
        await createUser();
        await createUser();
        await createUser();
        response = await getUsers('/users', token);
      });

      it('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      it('Response contains page, offset and limit params', () => {
        expect(Object.keys(response.body)).toContain('page', 'offset', 'limit');
      });

      it('Receive 3 users.', () => expect(response.body.page.length).toBe(3));

      it('Receive user ids 1, 2 and 3', () => {
        expect(response.body.page[0].id).toBe(1);
        expect(response.body.page[1].id).toBe(2);
        expect(response.body.page[2].id).toBe(3);
      });

      it('Receive offset = 0 and limit = 10', () => {
        expect(response.body.offset).toBe(0);
        expect(response.body.limit).toBe(10);
      });
    });

    describe('Empty response with out of range params', () => {
      beforeAll(async () => (response = await getUsers('/users?page=3&limit=2', token)));

      it('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      it('Response contains page, offset and limit params', () => {
        expect(Object.keys(response.body)).toContain('page', 'offset', 'limit');
      });

      it('Receive 0 users.', () => expect(response.body.page.length).toBe(0));
    });

    describe('Fail with non integer params', () => {
      beforeAll(async () => (response = await getUsers('/users?page=a&limit=2', token)));

      it('Receive status code 400.', () => expect(response.statusCode).toBe(400));

      it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.INVALID_PARAMS_ERROR));

      it(`Receive an '${errorsCatalog.PAGINATION_ERROR}' message`, () =>
        expect(response.body.message[0]).toBe(errorsCatalog.PAGINATION_ERROR));
    });
  });
});
