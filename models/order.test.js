'use strict';

const db = require('../db.js');
const Order = require('./order.js');
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
   test('works', async function () {
      const order = await Order.create({ username: 'u1', total: 49.99 });

      expect(order).toEqual({
         id: expect.any(Number),
         username: 'u1',
         total: '49.99',
      });
   });
});

/************************************** findAll */
describe('findAll', function () {
   test('works', async function () {
      const orders = await Order.findAll();
      expect(orders.length).toBeGreaterThanOrEqual(2);

      expect(orders).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               id: expect.any(Number),
               username: 'u1',
               total: '1199.98',
            }),
            expect.objectContaining({
               id: expect.any(Number),
               username: 'u2',
               total: '19.99',
            }),
         ])
      );
   });
});

// /************************************** get */
describe('get', function () {
   test('works', async function () {
      const orders = await Order.findAll();
      const order = await Order.get(orders[0].id);

      expect(order).toEqual(
         expect.objectContaining({
            id: orders[0].id,
            username: orders[0].username,
            total: '1199.98',
         })
      );
   });

   test('not found if no such order', async function () {
      await expect(Order.get(99999)).rejects.toThrow(NotFoundError);
   });
});

// /************************************** getAllOrdersForUser */
describe('getAllOrdersForUser', function () {
   test('works', async function () {
      const orders = await Order.getAllOrdersForUser('u1');
      expect(orders.length).toBeGreaterThan(0);
      expect(orders[0]).toEqual(
         expect.objectContaining({
            username: 'u1',
            total: '1199.98',
         })
      );
   });

   test('works if user has no orders', async function () {
      await db.query(`INSERT INTO users (username, password, first_name, last_name, email, is_admin)
                      VALUES ('u3', 'pass', 'F', 'L', 'u3@email.com', false)`);

      const orders = await Order.getAllOrdersForUser('u3');
      expect(orders).toEqual([]);
   });
});

// /************************************** update */
describe('update', function () {
   test('works', async function () {
      const orders = await Order.findAll();
      const updated = await Order.update(orders[0].id, { total: 123.45 });
      expect(updated.total).toEqual('123.45');
   });

   test('not found if no such order', async function () {
      await expect(Order.update(99999, { total: 12.34 })).rejects.toThrow(
         NotFoundError
      );
   });
});

// /************************************** remove */
describe('remove', function () {
   test('works', async function () {
      const order = await Order.create({ username: 'u1', total: 99.99 });
      await Order.remove(order.id);

      await expect(Order.get(order.id)).rejects.toThrow(NotFoundError);
   });

   test('not found if no such order', async function () {
      await expect(Order.remove(99999)).rejects.toThrow(NotFoundError);
   });
});
