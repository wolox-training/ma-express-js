const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const userService = require('../../app/services/users');
const weetService = require('../../app/services/weets');
const calificationService = require('../../app/services/califications');
const sessionsManager = require('../../app/services/sessions_manager');
const errorsCatalog = require('../../app/schemas/errors_catalog');
const errors = require('../../app/errors');
let { response } = require('../vars');
const { expiredToken } = require('../vars');

const { create: createUser } = require('../../test/factory/users');
const { create: createWeet } = require('../factory/weets');
const { create: createCalification } = require('../factory/califications');

const request = supertest(app);

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

let rawUser = {};
const weetsEndpoint = '/weets';

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

describe('/weets/:id/ratings [POST]', () => {
  const calificationParamsEndpoint = `${weetsEndpoint}/1/ratings`;
  beforeEach(async () => {
    const userLogin = {
      email: 'regular.user@wolox.com.ar',
      position: 'Developer'
    };
    userLogin.password = await hashPassword('hola1234');
    const createdUser = await createUser(userLogin);
    rawUser = sessionsManager.generateToken(createdUser.dataValues);
  });

  describe('When Authorization header is missing', () => {
    beforeAll(async () => {
      response = await request
        .post(calificationParamsEndpoint)
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
    beforeAll(async () => (response = await postRequest(calificationParamsEndpoint, expiredToken)));

    test('Receive status code 401.', () => expect(response.statusCode).toBe(401));

    test(`Receive an ${errors.TOKEN_EXPIRATION_ERROR} code`, () =>
      expect(response.body.internal_code).toEqual(errors.TOKEN_EXPIRATION_ERROR));

    test(`Receive an '${errorsCatalog.TOKEN_EXPIRATION_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.TOKEN_EXPIRATION_ERROR));
  });

  describe('When token is valid', () => {
    let calificationFound = {};
    const score = { rating: 1 };
    beforeAll(async () => {
      const weet = { creatorId: 1 };
      await createWeet(weet);
      await createWeet(weet);
      response = await postRequest(calificationParamsEndpoint, rawUser.token, score);
      calificationFound = await calificationService.findById(1);
    });

    test('Receive status code 201.', () => expect(response.statusCode).toBe(201));

    test('The calification was saved in the DB.', () => expect(calificationFound).toBeTruthy());
  });

  describe('When user receives a positive rating and ascends to next position', () => {
    const positionsMap = ['Developer', 'Lead', 'TL', 'EM', 'HEAD', 'CEO'];
    const thresholdArray = [4, 9, 19, 29, 49];

    const newCalification = { ratingUserId: 1, weetId: 1, score: 1 };
    const weet = { creatorId: 1 };
    let userPre = {};
    let userPost = {};

    thresholdArray.forEach((element, index) => {
      describe(`When user has ${element} points`, () => {
        beforeAll(async () => {
          await createWeet(weet);
          for (let i = 1; i < element; i++) await createCalification(newCalification);

          response = await postRequest(calificationParamsEndpoint, rawUser.token, { rating: 1 });
          userPre = await userService.findById(1);

          response = await postRequest(calificationParamsEndpoint, rawUser.token, { rating: 1 });
          userPost = await userService.findById(1);
        });

        it('Receive status 201 to post request', () => expect(response.status).toBe(201));

        it(`User position previosly to calification is ${positionsMap[index]}`, () =>
          expect(userPre.dataValues.position).toEqual(positionsMap[index]));

        it(`User position after calification is ${positionsMap[index + 1]}`, () =>
          expect(userPost.dataValues.position).toEqual(positionsMap[index + 1]));
      });
    });
  });

  describe('When user receives a negative rating and descends to previous position', () => {
    const positionsMap = ['Developer', 'Lead', 'TL', 'EM', 'HEAD', 'CEO'];
    const thresholdArray = [4, 9, 19, 29, 49];

    const newCalification = { ratingUserId: 1, weetId: 1, score: 1 };
    const weet = { creatorId: 1 };
    let userPre = {};
    let userPost = {};

    thresholdArray.forEach((element, index) => {
      describe(`When user has ${element + 1} points`, () => {
        beforeAll(async () => {
          await createWeet(weet);
          for (let i = 1; i < element + 1; i++) await createCalification(newCalification);

          response = await postRequest(calificationParamsEndpoint, rawUser.token, { rating: 1 });
          userPre = await userService.findById(1);

          response = await postRequest(calificationParamsEndpoint, rawUser.token, { rating: -1 });
          userPost = await userService.findById(1);
        });

        it('Receive status 201 to post request', () => expect(response.status).toBe(201));

        it(`User position previosly to calification is ${positionsMap[index + 1]}`, () =>
          expect(userPre.dataValues.position).toEqual(positionsMap[index + 1]));

        it(`User position after calification is ${positionsMap[index]}`, () =>
          expect(userPost.dataValues.position).toEqual(positionsMap[index]));
      });
    });
  });

  describe('When rate an invalid weet', () => {
    const badCalificationParamsEndpoint = `${weetsEndpoint}/3/ratings`;
    let calificationFound = {};
    const score = { rating: 1 };
    beforeAll(async () => {
      const weet = { creatorId: 1 };
      await createWeet(weet);
      await createWeet(weet);
      response = await postRequest(badCalificationParamsEndpoint, rawUser.token, score);
      calificationFound = await calificationService.findById(1);
    });

    test('Receive status code 503.', () => expect(response.statusCode).toBe(503));

    test(`Receive an ${errors.DATABASE_ERROR} code`, () =>
      expect(response.body.internal_code).toEqual(errors.DATABASE_ERROR));

    test(`Receive an '${errorsCatalog.CALIFICATION_ERROR}' message`, () =>
      expect(response.body.message).toBe(errorsCatalog.CALIFICATION_ERROR));

    test('The calification was not saved in the DB.', () => expect(calificationFound).toBeFalsy());
  });
});
