const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const weetService = require('../../app/services/weets');
const sessionsManager = require('../../app/services/sessions_manager');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');

const { create: createUser } = require('../../test/factory/users');

const request = supertest(app);

const postRequest = (endpoint, token) =>
  request
    .post(endpoint)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send();

const hashPassword = async password => {
  const salt = await bcrypt.genSaltSync(10);
  const hashedPass = await bcrypt.hashSync(password, salt);
  return hashedPass;
};

let rawUser = {};
const weetsEndpoint = '/weets';
let response = {};
const expiredToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaXNzIjoiSldUIiwiZXhwIjoiMjAyMS0wMS0wNFQxOToyODowMi45MjZaIn0.6ggVjEzgW7tjPLd_89qcDNVPD4NdqpCf0LCGsjEZBYU';

describe('/weets [POST]', () => {
  beforeEach(async () => {
    const userLogin = {
      email: 'regular.user@wolox.com.ar'
    };
    userLogin.password = await hashPassword('hola1234');
    const createdUser = await createUser(userLogin);
    rawUser = sessionsManager.generateToken(createdUser.dataValues);
  });

  describe('When Authorization header is missing', () => {
    beforeAll(async () => {
      response = await request
        .post(weetsEndpoint)
        .set('Accept', 'application/json')
        .send();
    });

    test('Receive status code 401.', () => expect(response.statusCode).toBe(401));

    test(`Receive an ${errors.AUTHORIZATION_ERROR} code`, () =>
      expect(response.body.internal_code).toBe(errors.AUTHORIZATION_ERROR));

    test(`Receive an '${errorsCatalog.AUTHORIZATION_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.AUTHORIZATION_ERROR));
  });

  describe('When token is expired', () => {
    beforeAll(async () => (response = await postRequest(weetsEndpoint, expiredToken)));

    test('Receive status code 401.', () => expect(response.statusCode).toBe(401));

    test(`Receive an ${errors.TOKEN_EXPIRATION_ERROR} code`, () =>
      expect(response.body.internal_code).toEqual(errors.TOKEN_EXPIRATION_ERROR));

    test(`Receive an '${errorsCatalog.TOKEN_EXPIRATION_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.TOKEN_EXPIRATION_ERROR));
  });

  describe('When token is valid', () => {
    describe('Receive a weet', () => {
      let weetFound = {};
      beforeAll(async () => {
        response = await postRequest(weetsEndpoint, rawUser.token);
        weetFound = await weetService.findById(1);
        console.log('WEET FOUND: ', weetFound);
      });

      test('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      test('Response contain weet param', () => expect(Object.keys(response.body)).toContain('weet'));

      test('Weet contain less than 140 characters.', () =>
        expect(response.body.weet.length).toBeLessThan(140));

      //   test('The weet was saved in the DB.', () => expect(weetFound).toBeTruthy());
    });

    // describe('Successful without pagination params', () => {
    //   beforeAll(async () => {
    //     await createUser();
    //     await createUser();
    //     await createUser();
    //     response = await getUsers('/users', rawToken.token);
    //   });

    //   test('Receive status code 200.', () => expect(response.statusCode).toBe(200));

    //   test('Response contains page, current_page and limit params', () => {
    //     expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit');
    //   });

    //   test('Receive 3 users.', () => expect(response.body.page.length).toBe(3));

    //   test('Receive user ids 1, 2 and 3', () => {
    //     expect(response.body.page[0].id).toBe(1);
    //     expect(response.body.page[1].id).toBe(2);
    //     expect(response.body.page[2].id).toBe(3);
    //   });

    //   test('Receive current_page = 1 and limit = 10', () => {
    //     expect(response.body.current_page).toBe(1);
    //     expect(response.body.limit).toBe(10);
    //   });
    // });

    // describe('Empty response with out of range params', () => {
    //   beforeAll(async () => (response = await getUsers('/users?page=3&limit=2', rawToken.token)));

    //   test('Receive status code 200.', () => expect(response.statusCode).toBe(200));

    //   test('Response contains page, current_page and limit params', () => {
    //     expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit');
    //   });

    //   test('Receive 0 users.', () => expect(response.body.page.length).toBe(0));
    // });

    // describe('Fail with non integer params', () => {
    //   beforeAll(async () => (response = await getUsers('/users?page=a&limit=2', rawToken.token)));

    //   test('Receive status code 400.', () => expect(response.statusCode).toBe(400));

    //   test(`Receive an ${errors.INVALID_PARAMS_ERROR} code`, () =>
    //     expect(response.body.internal_code).toEqual(errors.INVALID_PARAMS_ERROR));

    //   test(`Receive an '${errorsCatalog.PAGINATION_ERROR}' message`, () =>
    //     expect(response.body.message[0]).toBe(errorsCatalog.PAGINATION_ERROR));
    // });
  });
});
