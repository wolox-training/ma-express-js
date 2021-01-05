const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const userService = require('../../app/services/users');
const sessionsManager = require('../../app/services/sessions_manager');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');

const { create: createUser } = require('../../test/factory/users');

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
    let userFound = {};
    const username = 'admin';
    const userLogin = {
      email: `${username}@wolox.com.ar`,
      isAdmin: true
    };
    userLogin.password = await hashPassword('hola1234');
    await createUser(userLogin);
    userFound = await userService.emailExists(userLogin.email);
    rawAdmin = sessionsManager.generateToken(userFound.dataValues);
  });

  describe('When Authorization header is missing', () => {
    let response = {};
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
    let response = {};
    let userFound = {};
    let rawRegular = {};
    beforeAll(async () => {
      const regularUser = {
        email: 'regular@wolox.com.ar',
        isAdmin: false
      };
      await createUser(regularUser);
      userFound = await userService.emailExists(regularUser.email);
      rawRegular = sessionsManager.generateToken(userFound.dataValues);
      response = await postUser(adminEndpoint, newUser, rawRegular.token);
    });

    test('Receive status code 403.', () => expect(response.statusCode).toBe(403));

    it(`Receive an ${errors.AUTH_LEVEL_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.AUTH_LEVEL_ERROR));

    it(`Receive an '${errorsCatalog.AUTH_LEVEL_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.AUTH_LEVEL_ERROR));
  });

  describe('When user is admin', () => {
    describe('When send a new user', () => {
      let userExists = {};
      let userFound = {};
      let response = {};
      beforeAll(async () => {
        userExists = await userService.emailExists(newUser.email);
        response = await postUser(adminEndpoint, newUser, rawAdmin.token);
        userFound = await userService.emailExists(newUser.email);
      });

      it('User does not previously exist in DB.', () => expect(userExists).toBeFalsy());

      it('Receive status 201.', () => expect(response.statusCode).toBe(201));

      it('Receive an empty response.', () => expect(response.body).toEqual({}));

      it('User is admin.', () => expect(userFound.isAdmin).toBeTruthy());

      it('User was saved in the DB.', () => expect(userFound).toBeTruthy());
    });

    describe('When email previously exists', () => {
      let userExists = {};
      let userFound = {};
      let response = {};
      beforeAll(async () => {
        const user = {
          email: 'existent.email@wolox.com.ar',
          password: 'hola1234',
          name: 'Martin',
          lastName: 'Acosta',
          last_name: 'Acosta',
          isAdmin: false
        };
        await createUser(user);
        userExists = await userService.emailExists(user.email);
        response = await postUser(adminEndpoint, user, rawAdmin.token);
        userFound = await userService.emailExists(user.email);
      });

      it('The user already exists in the DB.', () => expect(userExists).toBeTruthy());

      it('The user was not previously an admin.', () => expect(userExists.dataValues.isAdmin).toBeFalsy());

      it('Receive status 201.', () => expect(response.status).toBe(201));

      it('Receive an empty response.', () => expect(response.body).toEqual({}));

      it('The user remain saved in the DB.', () => expect(userFound).toBeTruthy());

      it('The user is an admin.', () => expect(userFound.dataValues.isAdmin).toBeTruthy());
    });

    describe('with a short password', () => {
      let response = {};
      let userFound = {};
      const user = {
        email: 'upgradeable.user@wolox.com.ar',
        password: 'hola',
        name: 'Martin',
        last_name: 'Acosta'
      };
      beforeAll(async () => {
        response = await postUser(adminEndpoint, user, rawAdmin.token);
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
        email: 'upgradeable.user@wolox.com.ar',
        password: 'hola@123',
        name: 'Martin',
        last_name: 'Acosta'
      };
      beforeAll(async () => {
        response = await postUser(adminEndpoint, user, rawAdmin.token);
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
      let response = {};
      let userFound = {};
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
            userFound = await userService.emailExists(newUser.email);
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
