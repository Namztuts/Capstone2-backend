'use strict';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
   testUsers,
} = require('./_testCommon');

let testOrderId;

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /orders */
describe('POST /orders', () => {
   test('creates a new order', async () => {
      const resp = await request(app)
         .post('/orders')
         .send({ username: 'user1', total: 75.5 });
      expect(resp.statusCode).toBe(201);
      expect(resp.body.order).toEqual({
         id: expect.any(Number),
         username: 'user1',
         total: '75.50',
      });

      testOrderId = resp.body.order.id;
   });

   test('fails with invalid data', async () => {
      const resp = await request(app).post('/orders').send({ username: '' });
      expect(resp.statusCode).toBe(400);
   });
});

/************************************** GET /orders */
describe('GET /orders', () => {
   test('gets list of all orders', async () => {
      await db.query(`
         INSERT INTO orders (username, total)
         VALUES ('user1', 50.00)
      `);

      const resp = await request(app).get('/orders');
      expect(resp.statusCode).toBe(200);
      expect(resp.body.orders.length).toBeGreaterThan(0);
   });
});

/************************************** GET /orders/:id */
describe('GET /orders/:id', () => {
   test('gets a specific order', async () => {
      const result = await db.query(`
         INSERT INTO orders (username, total)
         VALUES ('user1', 99.99)
         RETURNING id
      `);
      const orderId = result.rows[0].id;

      const resp = await request(app).get(`/orders/${orderId}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body.order).toEqual({
         id: orderId,
         username: 'user1',
         total: '99.99',
         created_at: expect.any(String),
      });
   });

   test('404 if order not found', async () => {
      const resp = await request(app).get('/orders/999999');
      expect(resp.statusCode).toBe(404);
   });
});

/************************************** GET /orders/username/:username */
describe('GET /orders/username/:username', () => {
   test('gets orders for a specific user', async () => {
      await db.query(`
         INSERT INTO orders (username, total)
         VALUES ('user1', 33.33)
      `);

      const resp = await request(app).get('/orders/username/user1');
      expect(resp.statusCode).toBe(200);
      expect(resp.body.orders.length).toBeGreaterThan(0);
   });

   test('returns empty list if user has no orders', async () => {
      const resp = await request(app).get('/orders/username/testuser');
      expect(resp.statusCode).toBe(200);
      expect(resp.body.orders).toEqual([]);
   });
});

/************************************** PATCH /orders/:id */
describe('PATCH /orders/:id', () => {
   test('updates an order total', async () => {
      const result = await db.query(`
         INSERT INTO orders (username, total)
         VALUES ('user1', 25.00)
         RETURNING id
      `);
      const orderId = result.rows[0].id;

      const resp = await request(app)
         .patch(`/orders/${orderId}`)
         .send({ total: 40.0 });
      expect(resp.statusCode).toBe(200);
      expect(resp.body.order.total).toBe('40.00');
   });

   test('400 on invalid data', async () => {
      const resp = await request(app).patch('/orders/1').send({ total: -50 });
      expect(resp.statusCode).toBe(400);
   });

   test('404 if order not found', async () => {
      const resp = await request(app)
         .patch('/orders/999999')
         .send({ total: 10.0 });
      expect(resp.statusCode).toBe(404);
   });
});

/************************************** DELETE /orders/:id */
describe('DELETE /orders/:id', () => {
   test('deletes an order', async () => {
      const result = await db.query(`
         INSERT INTO orders (username, total)
         VALUES ('user1', 10.00)
         RETURNING id
      `);
      const orderId = result.rows[0].id;

      const resp = await request(app).delete(`/orders/${orderId}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({ deleted: `${orderId}` });
   });

   test('404 if not found', async () => {
      const resp = await request(app).delete('/orders/999999');
      expect(resp.statusCode).toBe(404);
   });
});
