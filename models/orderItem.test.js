'use strict';

const db = require('../db');
const CartItem = require('./orderItem'); // Assuming file is named orderItem.js
const Order = require('./order');
const Product = require('./product');
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
   it('adds a single order item', async function () {
      const orders = await Order.findAll();
      const products = await db.query('SELECT * FROM products');
      const usedProductIDs = (await CartItem.getAllByOrderID(orders[0].id)).map(
         (p) => p.product_id
      );
      const unusedProduct = products.rows.find(
         (p) => !usedProductIDs.includes(p.id)
      );

      const newItem = {
         order_id: orders[0].id,
         product_id: unusedProduct.id,
         quantity: 2,
         price_at_purchase: unusedProduct.price,
      };

      const item = await CartItem.add(newItem);
      expect(item).toEqual({
         id: expect.any(Number),
         orderID: newItem.order_id,
         productID: newItem.product_id,
         quantity: newItem.quantity,
         pricePurchased: newItem.price_at_purchase,
      });
   });
});

/************************************** addBulk */
describe('addBulk', function () {
   it('adds multiple order items', async function () {
      const newOrder = await Order.create({ username: 'u1', total: 100 });
      const productsRes = await db.query('SELECT * FROM products');
      const products = productsRes.rows;

      const items = [
         {
            order_id: newOrder.id,
            product_id: products[0].id,
            quantity: 1,
            price_at_purchase: products[0].price,
         },
         {
            order_id: newOrder.id,
            product_id: products[1].id,
            quantity: 3,
            price_at_purchase: products[1].price,
         },
      ];

      const result = await CartItem.addBulk(items);

      expect(result.length).toEqual(2);

      for (let i = 0; i < result.length; i++) {
         expect(result[i]).toEqual({
            id: expect.any(Number),
            orderID: newOrder.id,
            productID: items[i].product_id,
            quantity: items[i].quantity,
            pricePurchased: items[i].price_at_purchase,
         });
      }
   });
});

/************************************** findAll */
describe('findAll', function () {
   it('returns all order items', async function () {
      const items = await CartItem.findAll();
      expect(items.length).toBeGreaterThan(0);
      for (let item of items) {
         expect(item).toHaveProperty('order_id');
         expect(item).toHaveProperty('product_id');
         expect(item).toHaveProperty('quantity');
      }
   });
});

/************************************** get */
describe('get', function () {
   it('works', async function () {
      const all = await CartItem.findAll();
      const item = await CartItem.get(all[0].id);
      expect(item).toEqual(
         expect.objectContaining({
            order_id: all[0].order_id,
            product_id: all[0].product_id,
            quantity: all[0].quantity,
         })
      );
   });

   it('throws NotFoundError if not found', async function () {
      await expect(CartItem.get(999999)).rejects.toThrow(NotFoundError);
   });
});

/************************************** getAllByOrderID */
describe('getAllByOrderID', function () {
   it('returns items for valid order', async function () {
      const orders = await Order.findAll();
      const items = await CartItem.getAllByOrderID(orders[0].id);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('order_id');
      expect(items[0]).toHaveProperty('name');
   });

   it('throws NotFoundError if order has no items', async function () {
      const newOrder = await Order.create({ username: 'u1', total: 0 });
      await expect(CartItem.getAllByOrderID(newOrder.id)).rejects.toThrow(
         NotFoundError
      );
   });
});

/************************************** update */
describe('update', function () {
   it('updates quantity of order item', async function () {
      const items = await CartItem.findAll();
      const updated = await CartItem.update(items[0].id, { quantity: 10 });
      expect(updated.quantity).toBe(10);
   });

   it('throws NotFoundError if item not found', async function () {
      await expect(CartItem.update(999999, { quantity: 2 })).rejects.toThrow(
         NotFoundError
      );
   });
});

/************************************** remove */
describe('remove', function () {
   it('deletes order item', async function () {
      const items = await CartItem.findAll();
      await CartItem.remove(items[0].id);
      await expect(CartItem.get(items[0].id)).rejects.toThrow(NotFoundError);
   });

   it('throws NotFoundError if item not found', async function () {
      await expect(CartItem.remove(999999)).rejects.toThrow(NotFoundError);
   });
});
