const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const { Session } = require('../../../app/models');
const app = require('../../../app');
const userService = require('../../../app/services/users');
const sessionsManager = require('../../../app/services/sessions_manager');
const errorsCatalog = require('../../../app/schemas/errors_catalog');
const errors = require('../../../app/errors');
let { response, userFound } = require('../../vars');

const { create: createUser } = require('../../factory/users');
const { create: createSession } = require('../../factory/sessions');

const request = supertest(app);

const postUser = (endpoint, data) =>
  request
    .post(endpoint)
    .send(data)
    .set('Accept', 'application/json');

const postRequest = (endpoint, token, data = '') =>
  request
    .post(endpoint)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send(data);

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

describe('/users/sessions [POST]', () => {
  describe('When user email is not valid', () => {
    const userInvalid = {
      email: 'user@wolo.com.ar',
      password: 'hola1234'
    };

    beforeAll(async () => {
      response = await postUser('/users/sessions', userInvalid);
      userFound = await userService.findByEmail(userInvalid.email);
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
    const user = {
      email: 'user@wolox.com.ar',
      password: 'hola1234'
    };

    beforeAll(async () => {
      response = await postUser('/users/sessions', user);
      userFound = await userService.findByEmail(user.email);
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
        userFound = await userService.findByEmail(userRegister.email);
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
        userFound = await userService.findByEmail(userRegister.email);
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

describe('/users/sessions/invalidate_all [POST]', () => {
  describe('When user email is not valid', () => {
    const userInvalid = {
      email: 'user@wolo.com.ar',
      password: 'hola1234'
    };

    beforeAll(async () => {
      response = await postUser('/users/sessions', userInvalid);
      userFound = await userService.findByEmail(userInvalid.email);
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
    const user = {
      email: 'user@wolox.com.ar',
      password: 'hola1234'
    };

    beforeAll(async () => {
      response = await postUser('/users/sessions', user);
      userFound = await userService.findByEmail(user.email);
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
        userFound = await userService.findByEmail(userRegister.email);
      });

      it('The user is stored in the DB.', () => expect(userFound).toBeTruthy());

      it('Receive status 401.', () => expect(response.statusCode).toBe(401));

      it(`Receive an ${errors.CREDENTIALS_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.CREDENTIALS_ERROR));

      it(`Receive an '${errorsCatalog.CREDENTIALS_ERROR}' message`, () =>
        expect(response.body.message).toBe(errorsCatalog.CREDENTIALS_ERROR));
    });

    describe('When there are sessions stored in DB.', () => {
      let sessionFoundPre = {};
      let sessionFoundPost = {};
      let rawUser = {};

      beforeAll(async () => {
        const userLogin = {
          email: 'regular.user@wolox.com.ar',
          position: 'Developer'
        };
        userLogin.password = await hashPassword('hola1234');
        const createdUser = await createUser(userLogin);
        rawUser = sessionsManager.generateToken(createdUser.dataValues);
        await createSession({ token: rawUser.token });
        sessionFoundPre = await Session.findAll({ where: { userId: createdUser.dataValues.id } });
        response = await postRequest('/users/sessions/invalidate_all', rawUser.token);
        sessionFoundPost = await Session.findAll({ where: { userId: createdUser.dataValues.id } });
      });

      it('There is a user session stored in the DB.', () => expect(sessionFoundPre.length).toBe(1));

      it('Receive status 200.', () => expect(response.statusCode).toBe(200));

      it('After POST no sessions found in the DB.', () => expect(sessionFoundPost.length).toBe(0));
    });
  });
});
