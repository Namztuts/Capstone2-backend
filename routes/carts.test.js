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
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /carts */
describe('POST /carts', () => {
   test('creates a new cart', async () => {
      await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email, is_admin)
    VALUES ('newuser', 'password', 'New', 'User', 'newuser@example.com', false)
  `);

      const resp = await request(app)
         .post('/carts')
         .send({ username: 'newuser' });

      expect(resp.statusCode).toBe(201);
      expect(resp.body).toEqual({
         cart: {
            id: expect.any(Number),
            username: 'newuser',
         },
      });
   });

   test('fails with invalid data', async () => {
      const resp = await request(app).post('/carts').send({ username: '' });
      expect(resp.statusCode).toBe(400);
   });
});

/************************************** GET /carts */
describe('GET /carts', () => {
   test('gets list of all carts', async () => {
      const resp = await request(app).get('/carts');
      expect(resp.body.carts.length).toBeGreaterThanOrEqual(3);
      expect(resp.body.carts).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ username: 'admin' }),
            expect.objectContaining({ username: 'user1' }),
            expect.objectContaining({ username: 'testuser' }),
         ])
      );
   });
});

/************************************** GET /carts/:username */
describe('GET /carts/:username', () => {
   test("gets one user's cart", async () => {
      const resp = await request(app).get('/carts/user1');
      expect(resp.body.cart).toEqual({
         id: 2,
         username: 'user1',
      });
   });

   test('404 if not found', async () => {
      const resp = await request(app).get('/carts/nope');
      expect(resp.statusCode).toBe(404);
   });
});

/************************************** PATCH /carts/:username */
describe('PATCH /carts/:username', () => {
   test('updates a cart with the same username', async () => {
      const resp = await request(app)
         .patch('/carts/user1')
         .send({ username: 'user1' });
      expect(resp.body).toEqual({
         cart: {
            id: 2,
            username: 'user1',
         },
      });
   });

   test('400 with invalid data', async () => {
      const resp = await request(app)
         .patch('/carts/user1')
         .send({ username: '' });
      expect(resp.statusCode).toBe(400);
   });

   test('404 if cart not found', async () => {
      const resp = await request(app)
         .patch('/carts/nope')
         .send({ username: 'nope' });
      expect(resp.statusCode).toBe(404);
   });
});

/************************************** DELETE /carts/:username */
describe('DELETE /carts/:username', () => {
   test('deletes a cart', async () => {
      const resp = await request(app).delete('/carts/testuser');
      expect(resp.body).toEqual({ deleted: 'testuser' });
   });

   test('404 if not found', async () => {
      const resp = await request(app).delete('/carts/nope');
      expect(resp.statusCode).toBe(404);
   });
});

/************************************** DELETE /carts/:cartID/items */
describe('DELETE /carts/:cartID/items', () => {
   test('clears items from a cart', async () => {
      const productRes = await db.query(`
        INSERT INTO products (name, description, price, image_url, stock, category_id)
        VALUES ('Test Product', 'For cart test', 10.00, 'http://example.com', 5, 1)
        RETURNING id
`);

      const productId = productRes.rows[0].id;

      await db.query(
         `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES (1, $1, 2)
`,
         [productId]
      );

      const cartID = 1;
      const resp = await request(app).delete(`/carts/${cartID}/items`);
      expect(resp.body).toEqual({ deleted: `${cartID}` });
   });

   test('404 if cart ID invalid', async () => {
      const resp = await request(app).delete('/carts/999999/items');
      expect(resp.statusCode).toBe(404);
   });
});
