const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const userService = require('../../app/services/users');
const sessionsManager = require('../../app/services/sessions_manager');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');

const { create: createUser } = require('../factory/users');

const request = supertest(app);

const postUser = (endpoint, data) =>
  request
    .post(endpoint)
    .send(data)
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