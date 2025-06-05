'use strict';

const request = require('supertest');
const app = require('../app');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
   testUsers,
   createAdminToken,
   createUserToken,
} = require('./_testCommon');

let adminToken;
let userToken;

beforeAll(async () => {
   adminToken = await createAdminToken();
   userToken = await createUserToken();
   commonBeforeAll;
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */
describe('POST /users', () => {
   it('adds a new user (admin required)', async () => {
      const newUser = {
         username: 'newuser',
         password: 'newpass',
         firstName: 'New',
         lastName: 'User',
         email: 'new@example.com',
         isAdmin: false,
      };

      const resp = await request(app)
         .post('/users')
         .set('Authorization', `Bearer ${adminToken}`) // Set the admin token in the header
         .send(newUser);

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
      const resp = await request(app)
         .post('/users')
         .set('Authorization', `Bearer ${adminToken}`)
         .send({
            username: 'short',
            // missing other fields
         });
      expect(resp.statusCode).toBe(400);
   });

   it('fails if not admin', async () => {
      const newUser = {
         username: 'newuser',
         password: 'newpass',
         firstName: 'New',
         lastName: 'User',
         email: 'new@example.com',
         isAdmin: false,
      };

      const resp = await request(app)
         .post('/users')
         .set('Authorization', `Bearer ${userToken}`) // Non-admin user
         .send(newUser);

      expect(resp.statusCode).toBe(403); // Forbidden for non-admin
   });
});

/************************************** GET /users */
describe('GET /users', () => {
   it('returns list of all users (admin required)', async () => {
      const resp = await request(app)
         .get('/users')
         .set('Authorization', `Bearer ${adminToken}`); // Use the global admin token

      expect(resp.statusCode).toBe(200);
      expect(resp.body.users.length).toBeGreaterThanOrEqual(2);
   });

   it('returns 403 if not admin', async () => {
      const resp = await request(app)
         .get('/users')
         .set('Authorization', `Bearer ${userToken}`); // Use the global non-admin token

      expect(resp.statusCode).toBe(403); // Forbidden for non-admin users
   });
});

// // /************************************** GET /users/:username */
describe('GET /users/:username', () => {
   it('gets a specific user (correct user)', async () => {
      const resp = await request(app)
         .get(`/users/${testUsers[0].username}`)
         .set('Authorization', `Bearer ${userToken}`); // Correct user token

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

   it("returns 403 if a user tries to access another user's data", async () => {
      const resp = await request(app)
         .get(`/users/${testUsers[1].username}`)
         .set('Authorization', `Bearer ${userToken}`); // Non-admin trying to access another user’s data

      expect(resp.statusCode).toBe(403); // Forbidden if non-admin tries to access another user's data
   });

   //FIN:
   it("allows admin to access any user's data", async () => {
      const resp = await request(app)
         .get(`/users/${testUsers[1].username}`)
         .set('Authorization', `Bearer ${adminToken}`); // Admin token

      expect(resp.statusCode).toBe(200); // Admin should be able to access any user's data
   });

   //FIN:
   it('returns 404 for invalid user', async () => {
      const resp = await request(app)
         .get('/users/nope')
         .set('Authorization', `Bearer ${adminToken}`); // Admin trying to access non-existent user

      expect(resp.statusCode).toBe(404); // Should return 404 if user is not found
   });
});

// // /************************************** PATCH /users/:username */
describe('PATCH /users/:username', () => {
   it('updates a user (correct user)', async () => {
      const resp = await request(app)
         .patch(`/users/${testUsers[0].username}`)
         .set('Authorization', `Bearer ${userToken}`) // Correct user token
         .send({
            firstName: 'Updated',
            lastName: 'Name',
            password: 'newpassword',
         });

      expect(resp.statusCode).toBe(200);
      expect(resp.body.user.firstName).toBe('Updated');
   });

   it("returns 403 if a user tries to update another user's data", async () => {
      const resp = await request(app)
         .patch(`/users/${testUsers[1].username}`)
         .set('Authorization', `Bearer ${userToken}`) // Non-admin trying to update another user’s data
         .send({ firstName: 'Invalid Update' });

      expect(resp.statusCode).toBe(403); // Forbidden if non-admin tries to update another user's data
   });

   it("allows admin to update any user's data", async () => {
      const resp = await request(app)
         .patch(`/users/${testUsers[1].username}`)
         .set('Authorization', `Bearer ${adminToken}`) // Admin token
         .send({ firstName: 'Updated by Admin' });

      expect(resp.statusCode).toBe(200); // Admin should be able to update any user's data
   });

   it('fails on invalid data (e.g., invalid email)', async () => {
      const resp = await request(app)
         .patch(`/users/${testUsers[0].username}`)
         .set('Authorization', `Bearer ${userToken}`) // Correct user token
         .send({
            email: 'not-an-email',
         });

      expect(resp.statusCode).toBe(400); // Should return 400 for invalid data
   });
});

// // /************************************** DELETE /users/:username */
describe('DELETE /users/:username', () => {
   it('deletes a user (correct user)', async () => {
      const resp = await request(app)
         .delete(`/users/${testUsers[0].username}`)
         .set('Authorization', `Bearer ${userToken}`); // Correct user token

      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({ deleted: testUsers[0].username });
   });

   it("returns 403 if a user tries to delete another user's account", async () => {
      const resp = await request(app)
         .delete(`/users/${testUsers[1].username}`)
         .set('Authorization', `Bearer ${userToken}`); // Non-admin trying to delete another user’s account

      expect(resp.statusCode).toBe(403); // Forbidden if non-admin tries to delete another user's account
   });

   //FIN:
   it("allows admin to delete any user's account", async () => {
      const resp = await request(app)
         .delete(`/users/${testUsers[1].username}`)
         .set('Authorization', `Bearer ${adminToken}`); // Admin token

      expect(resp.statusCode).toBe(200); // Admin should be able to delete any user's account
   });

   //FIN:
   it('returns 404 if user not found', async () => {
      const resp = await request(app)
         .delete('/users/nope')
         .set('Authorization', `Bearer ${adminToken}`); // Admin trying to delete non-existent user

      expect(resp.statusCode).toBe(404); // Should return 404 if user is not found
   });
});
