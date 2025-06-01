'use strict';

const request = require('supertest');
const app = require('../app');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
   testProducts,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /products */
describe('POST /products', () => {
   test('adds a new product', async () => {
      const newProduct = {
         name: 'New Product',
         description: 'New product description',
         price: 9.99,
         imageUrl: 'http://example.com/new.png',
         stock: 25,
         categoryID: 1,
      };

      const resp = await request(app).post('/products').send(newProduct);
      console.log('testing', resp.body.product);
      expect(resp.statusCode).toBe(201);
      expect(resp.body.product).toEqual(
         expect.objectContaining({
            id: expect.any(Number),
            name: 'New Product',
            description: 'New product description',
            price: '9.99',
            imageUrl: 'http://example.com/new.png',
            stock: 25,
            categoryID: 1,
         })
      );
   });

   test('fails with invalid data', async () => {
      const resp = await request(app).post('/products').send({
         name: '', // invalid name
         price: -10, // invalid price
      });
      expect(resp.statusCode).toBe(400);
   });
});

/************************************** GET /products */
describe('GET /products', () => {
   test('gets all products', async () => {
      const resp = await request(app).get('/products');
      expect(resp.statusCode).toBe(200);
      expect(resp.body.products.length).toBeGreaterThanOrEqual(
         testProducts.length
      );
   });
});

/************************************** GET /products/:id */
describe('GET /products/:id', () => {
   test('gets a specific product', async () => {
      console.log('testing', testProducts[0]);
      const resp = await request(app).get(`/products/${testProducts[0].id}`);
      expect(resp.statusCode).toBe(200);
      testProducts[0].price = testProducts[0].price.toString();
      expect(resp.body.product).toEqual(testProducts[0]);
   });

   test('returns 404 for invalid id', async () => {
      const resp = await request(app).get('/products/99999');
      expect(resp.statusCode).toBe(404);
   });
});

/************************************** PATCH /products/:id */
describe('PATCH /products/:id', () => {
   test('updates a product', async () => {
      const updates = { price: 25.5, stock: 200 };
      const resp = await request(app)
         .patch(`/products/${testProducts[0].id}`)
         .send(updates);

      expect(resp.statusCode).toBe(200);
      expect(parseFloat(resp.body.product.price)).toBe(
         parseFloat(updates.price)
      );
      expect(resp.body.product.stock).toBe(updates.stock);
   });

   test('fails with invalid data', async () => {
      const resp = await request(app)
         .patch(`/products/${testProducts[0].id}`)
         .send({ price: -5 });
      expect(resp.statusCode).toBe(400);
   });
});

/************************************** DELETE /products/:id */
describe('DELETE /products/:id', () => {
   test('deletes a product', async () => {
      const resp = await request(app).delete(`/products/${testProducts[0].id}`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({ deleted: String(testProducts[0].id) });
   });

   test('returns 404 for invalid id', async () => {
      const resp = await request(app).delete('/products/99999');
      expect(resp.statusCode).toBe(404);
   });
});
