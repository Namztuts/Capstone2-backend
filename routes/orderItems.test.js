'use strict';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
   testProducts,
   testUsers,
} = require('./_testCommon');

let orderId;
let orderItemId;

beforeAll(async () => {
   await commonBeforeAll();

   // Create an order to attach items to
   const result = await db.query(`
      INSERT INTO orders (username, total)
      VALUES ('user1', 50.00)
      RETURNING id
   `);
   orderId = result.rows[0].id;
});

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /order-items */
describe('POST /order-items', () => {
   test('creates a single order item', async () => {
      const resp = await request(app).post('/order-items').send({
         order_id: orderId,
         product_id: testProducts[0].id,
         quantity: 2,
         price_at_purchase: 299.99,
      });

      expect(resp.statusCode).toBe(201);
      expect(resp.body.order_item).toEqual({
         id: expect.any(Number),
         orderID: orderId,
         productID: testProducts[0].id,
         quantity: 2,
         pricePurchased: '299.99',
      });

      orderItemId = resp.body.order_item.id;
   });

   test('400 for invalid input', async () => {
      const resp = await request(app).post('/order-items').send({}); // missing fields
      expect(resp.statusCode).toBe(400);
   });
});

/************************************** POST /order-items/bulk */
describe('POST /order-items/bulk', () => {
   test('creates multiple order items', async () => {
      const resp = await request(app)
         .post('/order-items/bulk')
         .send([
            {
               order_id: orderId,
               product_id: testProducts[0].id,
               quantity: 1,
               price_at_purchase: 299.99,
            },
            {
               order_id: orderId,
               product_id: testProducts[1].id,
               quantity: 3,
               price_at_purchase: 15.99,
            },
         ]);

      expect(resp.statusCode).toBe(201);
      expect(resp.body.addedItems.length).toBe(2);
   });

   test('400 if not array', async () => {
      const resp = await request(app)
         .post('/order-items/bulk')
         .send({ order_id: orderId });
      expect(resp.statusCode).toBe(400);
   });
});

// /************************************** GET /order-items */
describe('GET /order-items', () => {
   test('gets all order items', async () => {
      await db.query(
         `
      INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
      VALUES ($1, $2, $3, $4)
   `,
         [orderId, testProducts[0].id, 1, 299.99]
      );

      const resp = await request(app).get('/order-items');
      expect(resp.statusCode).toBe(200);
      expect(resp.body.order_items.length).toBeGreaterThan(0);
   });
});

// /************************************** GET /order-items/:id */
describe('GET /order-items/:id', () => {
   test('gets one order item by ID', async () => {
      const result = await db.query(
         `
         INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)
         RETURNING id
      `,
         [orderId, testProducts[0].id, 1, 299.99]
      );
      const id = result.rows[0].id;

      const resp = await request(app).get(`/order-items/${id}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body.order_item).toHaveProperty('id', id);
   });

   test('404 if not found', async () => {
      const resp = await request(app).get('/order-items/999999');
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** GET /order-items/order/:id */
describe('GET /order-items/order/:id', () => {
   test('gets all items for one order', async () => {
      // Insert a fresh order
      const result = await db.query(`
      INSERT INTO orders (username, total)
      VALUES ('user1', 50.00)
      RETURNING id
   `);
      const orderId = result.rows[0].id;

      // Insert an item into that order
      await db.query(
         `
      INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
      VALUES ($1, $2, 1, 299.99)
   `,
         [orderId, testProducts[0].id]
      );

      const resp = await request(app).get(`/order-items/order/${orderId}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body.order).toHaveProperty('items');
      expect(Array.isArray(resp.body.order.items)).toBe(true);
   });

   test('404 if order not found', async () => {
      const resp = await request(app).get('/order-items/order/999999');
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** PATCH /order-items/:id */
describe('PATCH /order-items/:id', () => {
   test('updates quantity', async () => {
      const insert = await db.query(
         `
         INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, 2, 299.99)
         RETURNING id
      `,
         [orderId, testProducts[0].id]
      );
      const id = insert.rows[0].id;

      const resp = await request(app)
         .patch(`/order-items/${id}`)
         .send({ quantity: 5 });

      expect(resp.statusCode).toBe(200);
      expect(resp.body.order_item.quantity).toBe(5);
   });

   test('400 for invalid update', async () => {
      const resp = await request(app)
         .patch('/order-items/1')
         .send({ quantity: 0 }); // fails validation
      expect(resp.statusCode).toBe(400);
   });

   test('404 if item not found', async () => {
      const resp = await request(app)
         .patch('/order-items/999999')
         .send({ quantity: 2 });
      expect(resp.statusCode).toBe(404);
   });
});

// /************************************** DELETE /order-items/:id */
describe('DELETE /order-items/:id', () => {
   test('deletes item', async () => {
      const insert = await db.query(
         `
         INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, 1, 299.99)
         RETURNING id
      `,
         [orderId, testProducts[0].id]
      );
      const id = insert.rows[0].id;

      const resp = await request(app).delete(`/order-items/${id}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({ deleted: `${id}` });
   });

   test('404 if not found', async () => {
      const resp = await request(app).delete('/order-items/999999');
      expect(resp.statusCode).toBe(404);
   });
});
