const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const sessionsManager = require('../../app/services/sessions_manager');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');
let { rawToken, response } = require('../vars');
const { expiredToken } = require('../vars');

const { create: createUser } = require('../factory/users');
const { create: createWeet } = require('../factory/weets');

const request = supertest(app);

const getWeets = (endpoint, token) =>
  request
    .get(endpoint)
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json')
    .send();

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

describe('/weets [GET]', () => {
  beforeEach(async () => {
    const userLogin = {
      email: 'regular.user@wolox.com.ar',
      password: 'hola1234'
    };
    userLogin.password = await hashPassword('hola1234');
    const userCreated = await createUser(userLogin);
    rawToken = sessionsManager.generateToken(userCreated.dataValues);
  });

  describe('When Authorization header is missing', () => {
    beforeAll(async () => {
      response = await request
        .get('/weets?page=1&limit=2')
        .send()
        .set('Accept', 'application/json');
    });

    test('Receive status code 401.', () => expect(response.statusCode).toBe(401));
  });

  describe('When token is expired', () => {
    describe('Fail with pagination params', () => {
      beforeAll(async () => (response = await getWeets('/weets?page=1&limit=2', expiredToken)));

      test('Receive status code 401.', () => expect(response.statusCode).toBe(401));

      test(`Receive an ${errors.TOKEN_EXPIRATION_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.TOKEN_EXPIRATION_ERROR));

      test(`Receive an '${errorsCatalog.TOKEN_EXPIRATION_ERROR}' message`, () =>
        expect(response.body.message).toBe(errorsCatalog.TOKEN_EXPIRATION_ERROR));
    });
  });

  describe('When token is valid', () => {
    describe('Successful with pagination params', () => {
      beforeAll(async () => {
        const weet = { creatorId: 1 };
        await createWeet(weet);
        await createWeet(weet);
        await createWeet(weet);
        response = await getWeets('/weets?page=1&limit=2', rawToken.token);
      });

      test('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      test('Response contains page, current_page and limit params', () =>
        expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit'));

      test('Receive 2 weets.', () => expect(response.body.page.length).toBe(2));

      test('Receive weets ids 1 and 2', () => {
        expect(response.body.page[0].id).toBe(1);
        expect(response.body.page[1].id).toBe(2);
      });

      test('Receive current_page = 1 and limit = 2', () => {
        expect(response.body.current_page).toBe(1);
        expect(response.body.limit).toBe(2);
      });
    });

    describe('Successful without pagination params', () => {
      beforeAll(async () => {
        const weet = { creatorId: 1 };
        await createWeet(weet);
        await createWeet(weet);
        await createWeet(weet);
        response = await getWeets('/weets', rawToken.token);
      });

      test('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      test('Response contains page, current_page and limit params', () =>
        expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit'));

      test('Receive 3 weets.', () => expect(response.body.page.length).toBe(3));

      test('Receive weets ids 1, 2 and 3', () => {
        expect(response.body.page[0].id).toBe(1);
        expect(response.body.page[1].id).toBe(2);
        expect(response.body.page[2].id).toBe(3);
      });

      test('Receive current_page = 1 and limit = 10', () => {
        expect(response.body.current_page).toBe(1);
        expect(response.body.limit).toBe(10);
      });
    });

    describe('Empty response with out of range params', () => {
      beforeAll(async () => (response = await getWeets('/weets?page=3&limit=2', rawToken.token)));

      test('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      test('Response contains page, current_page and limit params', () =>
        expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit'));

      test('Receive 0 weets.', () => expect(response.body.page.length).toBe(0));
    });

    describe('Fail with non integer params', () => {
      beforeAll(async () => (response = await getWeets('/weets?page=a&limit=2', rawToken.token)));

      test('Receive status code 400.', () => expect(response.statusCode).toBe(400));

      test(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.INVALID_PARAMS_ERROR));

      test(`Receive an '${errorsCatalog.PAGINATION_ERROR}' message`, () =>
        expect(response.body.message[0]).toBe(errorsCatalog.PAGINATION_ERROR));
    });
  });
});
