const supertest = require('supertest');
const app = require('../../app');
const userService = require('../../app/services/users');
const emailService = require('../../app/services/emails');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');
let { response, userFound } = require('../vars');

const { create: createUser } = require('../factory/users');

const request = supertest(app);

const postUser = (endpoint, data) =>
  request
    .post(endpoint)
    .send(data)
    .set('Accept', 'application/json');

describe('/users [POST]', () => {
  describe('with complete data ', () => {
    let emailResponse = {};
    const user = {
      email: 'complete.data@wolox.com.ar',
      password: 'hola1234',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      jest.setTimeout(30000);
      response = await postUser('/users', user);
      emailResponse = await emailService.sendWelcomeEmail(user);
      userFound = await userService.findByEmail(user.email);
    });

    it('Receive status 201.', () => expect(response.statusCode).toBe(201));

    it('Receive an empty response.', () => expect(response.body).toEqual({}));

    it('The user was saved in the DB.', () => expect(userFound).toBeTruthy());

    it('The welcome email was sent.', () => expect(emailResponse.accepted).toContain(user.email));
  });

  describe('with an existent email ', () => {
    const user = {
      email: 'existent.email@wolox.com.ar',
      password: 'hola1234',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      await createUser(user);
      userFound = await userService.findByEmail(user.email);
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
    const user = {
      email: 'short.password@wolox.com.ar',
      password: 'hola',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      response = await postUser('/users', user);
      userFound = await userService.findByEmail(user.email);
    });

    it('Receive status 400', () => expect(response.status).toBe(400));

    it(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.INVALID_PARAMS_ERROR));

    it(`Receive an '${errorsCatalog.PASSWORD_ERROR}' message`, () =>
      expect(response.body.message[0]).toBe(errorsCatalog.PASSWORD_ERROR));

    it('The user was not saved in the DB.', () => expect(userFound).toBeFalsy());
  });

  describe('with non alphanumeric password', () => {
    const user = {
      email: 'short.password@wolox.com.ar',
      password: 'hola1234@',
      name: 'Martin',
      last_name: 'Acosta'
    };

    beforeAll(async () => {
      response = await postUser('/users', user);
      userFound = await userService.findByEmail(user.email);
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
        const createIncompleteUser = { ...user };
        delete createIncompleteUser[param];
        beforeAll(async () => {
          response = await postUser('/users', createIncompleteUser);
          userFound = await userService.findByEmail(user.email);
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
