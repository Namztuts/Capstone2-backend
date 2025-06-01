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

/************************************** POST /users */
describe('POST /users', () => {
   it('adds a new user', async () => {
      const newUser = {
         username: 'newuser',
         password: 'newpass',
         firstName: 'New',
         lastName: 'User',
         email: 'new@example.com',
         isAdmin: false,
      };

      const resp = await request(app).post('/users').send(newUser);
      expect(resp.statusCode).toBe(201);
      expect(resp.body).toEqual({
         user: {
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
         },
         token: expect.any(String),
      });
   });

   it('fails on missing data', async () => {
      const resp = await request(app).post('/users').send({
         username: 'short',
         // missing other fields
      });
      expect(resp.statusCode).toBe(400);
   });
});

/************************************** GET /users */
describe('GET /users', () => {
   it('returns list of all users', async () => {
      const resp = await request(app).get('/users');
      expect(resp.statusCode).toBe(200);
      expect(resp.body.users.length).toBeGreaterThanOrEqual(2);
   });
});

// /************************************** GET /users/:username */
describe('GET /users/:username', () => {
   it('gets a specific user', async () => {
      const resp = await request(app).get(`/users/${testUsers[0].username}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body.user).toEqual({
         username: testUsers[0].username,
         firstName: testUsers[0].first_name,
         lastName: testUsers[0].last_name,
         email: testUsers[0].email,
         isAdmin: testUsers[0].is_admin,
         createdAt: expect.any(String),
      });
   });

   it('returns 404 for invalid user', async () => {
      const resp = await request(app).get('/users/nope');
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** PATCH /users/:username */
describe('PATCH /users/:username', () => {
   it('updates a user', async () => {
      const resp = await request(app)
         .patch(`/users/${testUsers[0].username}`)
         .send({
            firstName: 'Updated',
            lastName: 'Name',
            password: 'adminpass',
         });
      expect(resp.statusCode).toBe(200);
      expect(resp.body.user.firstName).toBe('Updated');
   });

   it('fails on invalid data', async () => {
      const resp = await request(app)
         .patch(`/users/${testUsers[0].username}`)
         .send({
            email: 'not-an-email',
         });
      expect(resp.statusCode).toBe(400);
   });
});

// /************************************** DELETE /users/:username */
describe('DELETE /users/:username', () => {
   it('deletes a user', async () => {
      const resp = await request(app).delete(`/users/${testUsers[1].username}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({ deleted: testUsers[1].username });
   });

   it('returns 404 if user not found', async () => {
      const resp = await request(app).delete('/users/nope');
      expect(resp.statusCode).toBe(404);
   });
});
