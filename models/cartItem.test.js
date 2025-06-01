'use strict';

const db = require('../db');
const CartItem = require('./cartItem');
const { NotFoundError } = require('../expressError');
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

/************************************** add */
describe('add', function () {
   test('adds new cart item', async function () {
      const cartRes = await db.query(
         `SELECT id FROM carts WHERE username = 'u1'`
      );
      const productRes = await db.query(
         `SELECT id FROM products WHERE name = 'Book'`
      );
      const cartId = cartRes.rows[0].id;
      const productId = productRes.rows[0].id;

      const newItem = await CartItem.add({
         cart_id: cartId,
         product_id: productId,
         quantity: 3,
      });

      expect(newItem).toEqual({
         id: expect.any(Number),
         cartID: cartId,
         productID: productId,
         quantity: 3,
      });
   });

   test('increments quantity if duplicate exists', async function () {
      const cartRes = await db.query(
         `SELECT id FROM carts WHERE username = 'u1'`
      );
      const productRes = await db.query(
         `SELECT id FROM products WHERE name = 'Phone'`
      );
      const cartId = cartRes.rows[0].id;
      const productId = productRes.rows[0].id;

      const updatedItem = await CartItem.add({
         cart_id: cartId,
         product_id: productId,
         quantity: 2,
      });

      expect(updatedItem).toEqual({
         id: expect.any(Number),
         cartID: cartId,
         productID: productId,
         quantity: 3, // 1 existing + 2 added
      });
   });
});

/************************************** findAll */
describe('findAll', function () {
   test('returns all cart items', async function () {
      const items = await CartItem.findAll();
      expect(items.length).toBeGreaterThan(0);
   });
});

// /************************************** get */
describe('get', function () {
   test('gets cart item by id', async function () {
      const res = await db.query(`SELECT id FROM cart_items LIMIT 1`);
      const item = await CartItem.get(res.rows[0].id);

      expect(item).toEqual(
         expect.objectContaining({
            id: res.rows[0].id,
            cart_id: expect.any(Number),
            product_id: expect.any(Number),
            quantity: expect.any(Number),
         })
      );
   });

   test('throws NotFoundError if not found', async function () {
      try {
         await CartItem.get(0);
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});

// /************************************** getAllByCartID */
describe('getAllByCartID', function () {
   test('gets all items for a cart', async function () {
      const res = await db.query(`SELECT id FROM carts WHERE username = 'u1'`);
      const items = await CartItem.getAllByCartID(res.rows[0].id);

      expect(Array.isArray(items)).toBe(true);
   });

   test('returns empty array if no items', async function () {
      const cart = await db.query(`SELECT id FROM carts WHERE username = 'u2'`);
      await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [
         cart.rows[0].id,
      ]);

      const items = await CartItem.getAllByCartID(cart.rows[0].id);
      expect(items).toEqual([]);
   });
});

// /************************************** update */
describe('update', function () {
   test('updates cart item', async function () {
      const res = await db.query(`SELECT id FROM cart_items LIMIT 1`);
      const updated = await CartItem.update(res.rows[0].id, { quantity: 5 });

      expect(updated.quantity).toBe(5);
   });

   test('throws NotFoundError if not found', async function () {
      try {
         await CartItem.update(0, { quantity: 5 });
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});

// /************************************** remove */
describe('remove', function () {
   test('removes cart item', async function () {
      const res = await db.query(`SELECT id FROM cart_items LIMIT 1`);
      await CartItem.remove(res.rows[0].id);

      const check = await db.query(`SELECT id FROM cart_items WHERE id = $1`, [
         res.rows[0].id,
      ]);
      expect(check.rows.length).toBe(0);
   });

   test('throws NotFoundError if not found', async function () {
      try {
         await CartItem.remove(0);
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});

// /************************************** clearCartItems */
describe('clearCartItems', function () {
   test('clears all items for a cart', async function () {
      const cart = await db.query(`SELECT id FROM carts WHERE username = 'u1'`);
      await CartItem.clearCartItems(cart.rows[0].id);

      const check = await db.query(
         `SELECT * FROM cart_items WHERE cart_id = $1`,
         [cart.rows[0].id]
      );
      expect(check.rows.length).toBe(0);
   });

   test('throws NotFoundError if nothing to clear', async function () {
      const cartRes = await db.query(
         `SELECT id FROM carts WHERE username = 'u2'`
      );
      const cartId = cartRes.rows[0].id;

      // Delete all items to simulate an empty cart
      await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

      try {
         await CartItem.clearCartItems(cartId);
         fail();
      } catch (err) {
         expect(err instanceof NotFoundError).toBeTruthy();
      }
   });
});
