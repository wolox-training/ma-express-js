const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
// const userService = require('../app/services/users');
// const sessionsManager = require('../app/services/sessions_manager');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');

const { create: createUser } = require('../factory/users');

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

describe.only('/users [GET]', () => {
  let token = {};
  beforeEach(async () => {
    const username = `user${Math.floor(Math.random() * 100)}`;
    const userLogin = {
      email: `${username}@wolox.com.ar`,
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
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaXNzIjoiSldUIiwiZXhwIjoiMjAyMS0wMS0wNFQxOToyODowMi45MjZaIn0.6ggVjEzgW7tjPLd_89qcDNVPD4NdqpCf0LCGsjEZBYU';
    let response = {};

    describe('When send page = 1 and limit = 2 as query params', () => {
      beforeAll(async () => (response = await getUsers('/users?page=1&limit=2', expiredToken)));

      it('Receive status code 401.', () => expect(response.statusCode).toBe(401));

      it(`Receive an ${errors.TOKEN_EXPIRATION_ERROR} code`, () =>
        expect(response.body.internal_code).toEqual(errors.TOKEN_EXPIRATION_ERROR));

      it(`Receive an '${errorsCatalog.TOKEN_EXPIRATION_ERROR}' message`, () =>
        expect(response.body.message).toBe(errorsCatalog.TOKEN_EXPIRATION_ERROR));
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

      it('Response contains page, current_page and limit params', () => {
        expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit');
      });

      it('Receive 2 users.', () => expect(response.body.page.length).toBe(2));

      it('Receive user ids 1 and 2', () => {
        expect(response.body.page[0].id).toBe(1);
        expect(response.body.page[1].id).toBe(2);
      });

      it('Receive current_page = 1 and limit = 2', () => {
        expect(response.body.current_page).toBe(1);
        expect(response.body.limit).toBe(2);
      });
    });

    describe('Successful without pagination params', () => {
      beforeAll(async () => {
        await createUser();
        await createUser();
        response = await getUsers('/users', token);
      });

      it('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      it('Response contains page, current_page and limit params', () => {
        expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit');
      });

      it('Receive 3 users.', () => expect(response.body.page.length).toBe(3));

      it('Receive user ids 1, 2 and 3', () => {
        expect(response.body.page[0].id).toBe(1);
        expect(response.body.page[1].id).toBe(2);
        expect(response.body.page[2].id).toBe(3);
      });

      it('Receive current_page = 1 and limit = 10', () => {
        expect(response.body.current_page).toBe(1);
        expect(response.body.limit).toBe(10);
      });
    });

    describe('Empty response with out of range params', () => {
      beforeAll(async () => (response = await getUsers('/users?page=3&limit=2', token)));

      it('Receive status code 200.', () => expect(response.statusCode).toBe(200));

      it('Response contains page, current_page and limit params', () => {
        expect(Object.keys(response.body)).toContain('page', 'current_page', 'limit');
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
