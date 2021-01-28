const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const userService = require('../../app/services/users');
const sessionsManager = require('../../app/services/sessions_manager');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');
let { response, userFound } = require('../vars');

const { create: createUser } = require('../../test/factory/users');
const { create: createSession } = require('../factory/sessions');

const request = supertest(app);

const postUser = (endpoint, data, token) =>
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

let rawAdmin = {};
const adminEndpoint = '/admin/users';

describe('/admin/users [POST]', () => {
  const newUser = {
    email: 'upgradeable.user@wolox.com.ar',
    password: 'hola1234',
    name: 'Martin',
    last_name: 'Acosta'
  };
  beforeEach(async () => {
    jest.setTimeout(30000);
    const username = 'admin';
    const userLogin = {
      email: `${username}@wolox.com.ar`,
      isAdmin: true
    };
    userLogin.password = await hashPassword('hola1234');
    const createdUser = await createUser(userLogin);
    rawAdmin = sessionsManager.generateToken(createdUser.dataValues);
  });

  describe('When Authorization header is missing', () => {
    beforeAll(async () => {
      response = await request
        .post(adminEndpoint)
        .set('Accept', 'application/json')
        .send(newUser);
    });

    test('Receive status code 401.', () => expect(response.statusCode).toBe(401));

    it(`Receive an ${errors.AUTHORIZATION_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.AUTHORIZATION_ERROR));

    it(`Receive an '${errorsCatalog.AUTHORIZATION_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.AUTHORIZATION_ERROR));
  });

  describe('When user is not admin', () => {
    let rawRegular = {};
    beforeAll(async () => {
      const regularUser = {
        email: 'regular@wolox.com.ar',
        isAdmin: false
      };
      const createdRegularUser = await createUser(regularUser);
      rawRegular = sessionsManager.generateToken(createdRegularUser.dataValues);
      await createSession({ token: rawRegular.token });
      response = await postUser(adminEndpoint, newUser, rawRegular.token);
    });

    test('Receive status code 403.', () => expect(response.statusCode).toBe(403));

    it(`Receive an ${errors.FORBIDDEN_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.FORBIDDEN_ERROR));

    it(`Receive an '${errorsCatalog.FORBIDDEN_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.FORBIDDEN_ERROR));
  });

  describe('When user is admin', () => {
    describe('When send a new user', () => {
      let userExists = {};
      beforeAll(async () => {
        userExists = await userService.findByEmail(newUser.email);
        await createSession({ token: rawAdmin.token });
        response = await postUser(adminEndpoint, newUser, rawAdmin.token);
        userFound = await userService.findByEmail(newUser.email);
      });

      it('User does not previously exist in DB.', () => expect(userExists).toBeFalsy());

      it('Receive status 201.', () => expect(response.statusCode).toBe(201));

      it('Receive an empty response.', () => expect(response.body).toEqual({}));

      it('User is admin.', () => expect(userFound.isAdmin).toBeTruthy());

      it('User was saved in the DB.', () => expect(userFound).toBeTruthy());
    });

    describe('When user exists and its not an admin', () => {
      let userExists = {};
      beforeAll(async () => {
        const user = {
          email: 'existent.email@wolox.com.ar',
          password: 'hola1234',
          name: 'Martin',
          last_name: 'Acosta',
          isAdmin: false
        };
        await createUser(user);
        userExists = await userService.findByEmail(user.email);
        await createSession({ token: rawAdmin.token });
        response = await postUser(adminEndpoint, user, rawAdmin.token);
        userFound = await userService.findByEmail(user.email);
      });

      it('The user already exists in the DB.', () => expect(userExists).toBeTruthy());

      it('The user was not previously an admin.', () => expect(userExists.dataValues.isAdmin).toBeFalsy());

      it('Receive status 201.', () => expect(response.status).toBe(201));

      it('Receive an empty response.', () => expect(response.body).toEqual({}));

      it('The user remain saved in the DB.', () => expect(userFound).toBeTruthy());

      it('The user is an admin.', () => expect(userFound.dataValues.isAdmin).toBeTruthy());
    });

    describe('with a short password', () => {
      const user = {
        email: 'upgradeable.user@wolox.com.ar',
        password: 'hola',
        name: 'Martin',
        last_name: 'Acosta'
      };
      beforeAll(async () => {
        response = await postUser(adminEndpoint, user, rawAdmin.token);
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
        email: 'upgradeable.user@wolox.com.ar',
        password: 'hola@123',
        name: 'Martin',
        last_name: 'Acosta'
      };
      beforeAll(async () => {
        response = await postUser(adminEndpoint, user, rawAdmin.token);
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
      bodyParams.forEach(param => {
        describe(`When ${param} is not sent`, () => {
          const createIncompleteUser = { ...newUser };
          delete createIncompleteUser[param];
          beforeAll(async () => {
            response = await postUser(adminEndpoint, createIncompleteUser, rawAdmin.token);
            userFound = await userService.findByEmail(newUser.email);
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
});
