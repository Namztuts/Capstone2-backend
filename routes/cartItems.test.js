'use strict';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
   testCarts,
   testProducts,
} = require('./_testCommon');

let cartItemId;

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /cart-items */
describe('POST /cart-items', () => {
   test('adds a new item to cart', async () => {
      const resp = await request(app).post('/cart-items').send({
         cart_id: testCarts[0].id,
         product_id: testProducts[0].id,
         quantity: 2,
      });
      expect(resp.statusCode).toBe(201);
      expect(resp.body.cart_item).toEqual({
         id: expect.any(Number),
         cartID: testCarts[0].id,
         productID: testProducts[0].id,
         quantity: 2,
      });

      cartItemId = resp.body.cart_item.id; // save for later
   });

   test('fails with invalid data', async () => {
      const resp = await request(app).post('/cart-items').send({}); // missing required fields
      expect(resp.statusCode).toBe(400);
   });
});

/************************************** GET /cart-items */
describe('GET /cart-items', () => {
   test('gets list of all cart items', async () => {
      const insert = await db.query(
         `
         INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, 1)
         RETURNING id
      `,
         [testCarts[0].id, testProducts[0].id]
      );

      const resp = await request(app).get('/cart-items');
      expect(resp.body.cart_items.length).toBeGreaterThan(0);
   });
});

// /************************************** GET /cart-items/:id */
describe('GET /cart-items/:id', () => {
   test('gets one cart item', async () => {
      const insert = await db.query(
         `
         INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, 1)
         RETURNING id
      `,
         [testCarts[0].id, testProducts[0].id]
      );

      const id = insert.rows[0].id;

      const resp = await request(app).get(`/cart-items/${id}`);
      expect(resp.body.cart_item).toEqual({
         id,
         cart_id: testCarts[0].id,
         product_id: testProducts[0].id,
         quantity: 1,
      });
   });

   test('404 if not found', async () => {
      const resp = await request(app).get('/cart-items/999999');
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** GET /cart-items/cart/:id */
describe('GET /cart-items/cart/:id', () => {
   test('gets all items by cart id', async () => {
      await db.query(
         `
         INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, 3)
      `,
         [testCarts[0].id, testProducts[0].id]
      );

      const resp = await request(app).get(
         `/cart-items/cart/${testCarts[0].id}`
      );
      expect(resp.body.cart).toHaveProperty('id');
      expect(resp.body.cart).toHaveProperty('username');
      expect(resp.body.cart.items.length).toBeGreaterThan(0);
   });

   test('404 if cart not found', async () => {
      const resp = await request(app).get('/cart-items/cart/999999');
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** PATCH /cart-items/:id */
describe('PATCH /cart-items/:id', () => {
   test('updates cart item quantity', async () => {
      const insert = await db.query(
         `
         INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, 1)
         RETURNING id
      `,
         [testCarts[0].id, testProducts[0].id]
      );

      const id = insert.rows[0].id;

      const resp = await request(app)
         .patch(`/cart-items/${id}`)
         .send({ quantity: 5 });

      expect(resp.body.cart_item).toEqual({
         id,
         cartID: testCarts[0].id,
         productID: testProducts[0].id,
         quantity: 5,
      });
   });

   test('400 on invalid data', async () => {
      const resp = await request(app)
         .patch('/cart-items/1')
         .send({ quantity: 0 }); // violates schema (check > 0)
      expect(resp.statusCode).toBe(400);
   });

   test('404 if not found', async () => {
      const resp = await request(app)
         .patch('/cart-items/999999')
         .send({ quantity: 3 });
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** DELETE /cart-items/:id */
describe('DELETE /cart-items/:id', () => {
   test('deletes a cart item', async () => {
      const insert = await db.query(
         `
         INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, 1)
         RETURNING id
      `,
         [testCarts[0].id, testProducts[0].id]
      );

      const id = insert.rows[0].id;

      const resp = await request(app).delete(`/cart-items/${id}`);
      expect(resp.body).toEqual({ deleted: `${id}` });
   });

   test('404 if not found', async () => {
      const resp = await request(app).delete('/cart-items/999999');
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** DELETE /cart-items/cart/:cartID */
describe('DELETE /cart-items/cart/:cartID', () => {
   test('clears all items in a cart', async () => {
      await db.query(
         `
         INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES ($1, $2, 2)
      `,
         [testCarts[0].id, testProducts[0].id]
      );

      const resp = await request(app).delete(
         `/cart-items/cart/${testCarts[0].id}`
      );
      expect(resp.body).toEqual({ deleted: `${testCarts[0].id}` });
   });

   test('404 if cart has no items', async () => {
      const resp = await request(app).delete(`/cart-items/cart/999999`);
      expect(resp.statusCode).toBe(404);
   });
});
