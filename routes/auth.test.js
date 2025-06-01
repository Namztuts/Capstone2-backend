'use strict';

const request = require('supertest');
const app = require('../app');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
   testUsers,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const testUserData = testUsers.find((u) => u.username === 'testuser');

/************************************** POST /auth/token */
describe('POST /auth/token', function () {
   it('authenticates valid user', async function () {
      const resp = await request(app).post('/auth/token').send({
         username: testUserData.username,
         password: testUserData.password,
      });
      expect(resp.body).toEqual({
         token: expect.any(String),
      });
   });

   it('fails with wrong password', async function () {
      const resp = await request(app).post('/auth/token').send({
         username: testUserData.username,
         password: 'wrong',
      });
      expect(resp.statusCode).toBe(401);
   });
});

/************************************** POST /auth/register */
describe('POST /auth/register', function () {
   it('registers a new user and returns token', async function () {
      const resp = await request(app).post('/auth/register').send({
         username: 'newuser',
         password: 'newpassword',
         firstName: 'New',
         lastName: 'User',
         email: 'newuser@example.com',
      });

      expect(resp.statusCode).toBe(201);
      expect(resp.body).toEqual({
         token: expect.any(String),
      });
   });

   it('fails with invalid data', async function () {
      const resp = await request(app).post('/auth/register').send({
         username: 'x',
         // missing fields
      });

      expect(resp.statusCode).toBe(400);
   });
});
