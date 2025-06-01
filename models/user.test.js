'use strict';

const db = require('../db.js');
const User = require('./user.js');
const {
   BadRequestError,
   NotFoundError,
   UnauthorizedError,
} = require('../expressError');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//test that we are connected to the correct DB
test('connected to test database', async () => {
   const res = await db.query('SELECT current_database()');
   expect(res.rows[0].current_database).toEqual('a_and_e_test');
});

/************************************** authenticate */
describe('authenticate', function () {
   test('works', async function () {
      const user = await User.authenticate('u1', 'password1');
      expect(user).toEqual({
         username: 'u1',
         firstName: 'U1F',
         lastName: 'U1L',
         email: 'user1@email.com',
         isAdmin: false,
      });
   });

   test('unauth if no such user', async function () {
      try {
         await User.authenticate('nope', 'password');
         fail();
      } catch (err) {
         expect(err instanceof UnauthorizedError).toBeTruthy();
      }
   });

   test('unauth if wrong password', async function () {
      try {
         await User.authenticate('u1', 'wrong');
         fail();
      } catch (err) {
         expect(err instanceof UnauthorizedError).toBeTruthy();
      }
   });
});

/************************************** register */
describe('register', function () {
   const newUser = {
      username: 'new',
      firstName: 'Test',
      lastName: 'User',
      email: 'new@test.com',
      password: 'password',
      isAdmin: false,
   };

   test('works', async function () {
      const user = await User.register(newUser);
      expect(user).toEqual({
         username: 'new',
         firstName: 'Test',
         lastName: 'User',
         email: 'new@test.com',
         isAdmin: false,
      });

      const found = await db.query(
         "SELECT * FROM users WHERE username = 'new'"
      );
      expect(found.rows.length).toEqual(1);
      expect(found.rows[0].password.startsWith('$2b$')).toBeTruthy(); // bcrypt
   });

   test('bad request with duplicate', async function () {
      try {
         await User.register(newUser);
         await User.register(newUser);
         fail();
      } catch (err) {
         expect(err instanceof BadRequestError).toBeTruthy();
      }
   });
});

// /************************************** get */
describe('get', function () {
   test('works', async function () {
      const user = await User.get('u1');
      expect(user).toEqual({
         username: 'u1',
         firstName: 'U1F',
         lastName: 'U1L',
         email: 'user1@email.com',
         isAdmin: false,
         createdAt: expect.any(Date),
      });
   });

   test('not found if no such user', async function () {
      try {
         await User.get('nope');
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});

// /************************************** update */
describe('update', function () {
   const updateData = {
      firstName: 'Updated',
      lastName: 'User',
      email: 'updated@email.com',
      isAdmin: true,
      password: 'password1',
   };

   test('not found if no such user', async function () {
      try {
         await User.update('nope', updateData);
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });

   test('works', async function () {
      const user = await User.update('u1', updateData);
      expect(user).toEqual({
         username: 'u1',
         ...updateData,
      });
   });

   test('bad request with no data', async function () {
      try {
         await User.update('u1', {});
         fail();
      } catch (err) {
         expect(err instanceof BadRequestError).toBeTruthy();
      }
   });
});

// /************************************** remove */
describe('remove', function () {
   test('works', async function () {
      await User.remove('u1');
      const res = await db.query("SELECT * FROM users WHERE username='u1'");
      expect(res.rows.length).toEqual(0);
   });

   test('not found if no such user', async function () {
      try {
         await User.remove('nope');
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});
