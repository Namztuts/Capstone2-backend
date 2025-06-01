'use strict';

const db = require('../db.js');
const Cart = require('../models/cart');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
} = require('./_testCommon');
const { NotFoundError } = require('../expressError');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe('create', function () {
   test('works for new user', async function () {
      // Insert a new user (this user does NOT exist in commonBeforeAll)
      await db.query(`
      INSERT INTO users (username, password, first_name, last_name, email, is_admin)
      VALUES ('newUser', 'password', 'New', 'User', 'new@user.com', false)
    `);

      const cart = await Cart.create({ username: 'newUser' });
      expect(cart).toEqual({
         id: expect.any(Number),
         username: 'newUser',
      });
   });

   test('throws error if cart already exists', async function () {
      await expect(Cart.create({ username: 'u1' })).rejects.toThrow(
         'Duplicate cart for user: u1'
      );
   });
});

/************************************** findAll */
describe('findAll', function () {
   test('returns all carts', async function () {
      const carts = await Cart.findAll();
      expect(carts.length).toBeGreaterThanOrEqual(2);
      expect(carts).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ username: 'u1' }),
            expect.objectContaining({ username: 'u2' }),
         ])
      );
   });
});

// /************************************** get */
describe('get', function () {
   test('returns cart by username', async function () {
      const cart = await Cart.get('u1');
      expect(cart).toEqual({
         id: expect.any(Number),
         username: 'u1',
      });
   });

   test('throws NotFoundError if cart not found', async function () {
      try {
         await Cart.get('nope');
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});

// /************************************** getByID */
describe('getByID', function () {
   test('returns cart by ID', async function () {
      const cart = await Cart.get('u2');
      const found = await Cart.getByID(cart.id);
      expect(found).toEqual(cart);
   });

   test('throws NotFoundError if ID not found', async function () {
      try {
         await Cart.getByID(999999);
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});

// /************************************** update */
describe('update', function () {
   test('updates username', async function () {
      // Create the new user first
      await db.query(`
      INSERT INTO users (username, password, first_name, last_name, email, is_admin)
      VALUES ('updatedUser', 'password', 'Updated', 'User', 'updated@user.com', false)
   `);

      const updated = await Cart.update('u2', { username: 'updatedUser' });
      expect(updated).toEqual({
         id: expect.any(Number),
         username: 'updatedUser',
      });

      const dbRes = await db.query(
         `SELECT * FROM carts WHERE username = 'updatedUser'`
      );
      expect(dbRes.rows.length).toBe(1);
   });

   test("throws NotFoundError if username doesn't exist", async function () {
      await expect(Cart.update('nope', { username: 'fail' })).rejects.toThrow(
         NotFoundError
      );
   });
});

// /************************************** remove */
describe('remove', function () {
   test('removes a cart', async function () {
      await Cart.remove('u2');
      const res = await db.query(`SELECT * FROM carts WHERE username = 'u2'`);
      expect(res.rows.length).toBe(0);
   });

   test('throws NotFoundError if cart not found', async function () {
      try {
         await Cart.remove('nope');
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});
