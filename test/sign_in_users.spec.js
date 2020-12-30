const supertest = require('supertest');
const jwt = require('jwt-simple');
const app = require('../app');
const userService = require('../app/services/users');
const errorsCatalog = require('../app/schemas/errors_catalog');
const errors = require('../app/errors');

const request = supertest(app);

const postUser = (endpoint, data) =>
  request
    .post(endpoint)
    .send(data)
    .set('Accept', 'application/json');

describe('If POST /users/sessions', () => {
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
      password: 'hola1234',
      name: 'Martin',
      last_name: 'Acosta'
    };

    describe('When password not match', () => {
      const userLogin = {
        email: 'user@wolox.com.ar',
        password: 'hola12345'
      };

      beforeAll(async () => {
        await postUser('/users', userRegister);
        userFound = await userService.emailExists(userRegister.email);
        response = await postUser('/users/sessions', userLogin);
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
        await postUser('/users', userRegister);
        userFound = await userService.emailExists(userRegister.email);
        response = await postUser('/users/sessions', userLogin);
      });

      it('The user is stored in the DB.', () => expect(userFound).toBeTruthy());

      it('Receive status 200.', () => expect(response.statusCode).toBe(200));

      it('Receive a token.', () => expect(Object.keys(response.body)).toEqual(['token']));

      it('The decoded token should contain id and email', () => {
        payload = jwt.decode(response.body.token, 'hola1234');
        expect(Object.keys(payload)).toEqual(['id', 'email']);
      });

      it('The email contained in token should be the user`s email.', () =>
        expect(payload.email).toBe(userLogin.email));
    });
  });
});