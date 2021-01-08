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
    let weetFound = {};
    beforeAll(async () => {
      response = await postRequest(weetsEndpoint, rawUser.token);
      weetFound = await weetService.findById(1);
    });

    test('Receive status code 201.', () => expect(response.statusCode).toBe(201));

    test('Weet contain less than 140 characters.', () =>
      expect(weetFound.dataValues.content.length).toBeLessThanOrEqual(140));

    test('The weet was saved in the DB.', () => expect(weetFound).toBeTruthy());
  });
});
