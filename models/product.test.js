'use strict';

const db = require('../db');
const Product = require('../models/product');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
} = require('./_testCommon');
const { NotFoundError, BadRequestError } = require('../expressError');

let electronicsId;
let booksId;
let clothingId;

beforeAll(async () => {
   await commonBeforeAll();

   // Fetch category IDs dynamically for use in tests
   const categoriesRes = await db.query(`SELECT id, name FROM categories`);
   electronicsId = categoriesRes.rows.find((c) => c.name === 'Electronics').id;
   booksId = categoriesRes.rows.find((c) => c.name === 'Books').id;
   clothingId = categoriesRes.rows.find((c) => c.name === 'Clothing').id;
});

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe('Product.create', () => {
   test('creates a product successfully', async () => {
      const newProduct = {
         name: 'T-Shirt',
         description: 'Comfortable cotton t-shirt',
         price: 29.99,
         image_url: 'http://img.com/tshirt',
         stock: 50,
         category_id: clothingId,
      };

      const product = await Product.create(newProduct);
      expect(product).toEqual(
         expect.objectContaining({
            id: expect.any(Number),
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price.toString(),
            imageUrl: newProduct.image_url,
            stock: newProduct.stock,
            categoryID: newProduct.category_id,
         })
      );
   });

   test('throws BadRequestError on duplicate product id', async () => {
      //using an existing product id from DB
      const existingProductRes = await db.query(
         `SELECT id FROM products LIMIT 1`
      );
      const existingId = existingProductRes.rows[0].id;

      const duplicateProduct = {
         id: existingId,
         name: 'Duplicate',
         description: 'Duplicate product',
         price: 10,
         image_url: 'http://img.com/dup',
         stock: 1,
         category_id: electronicsId,
      };

      await expect(Product.create(duplicateProduct)).rejects.toThrow(
         BadRequestError
      );
   });
});

/************************************** findAll */
describe('findAll', () => {
   test('finds all products', async () => {
      const products = await Product.findAll();
      expect(products.length).toBeGreaterThanOrEqual(3);

      expect(products).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               name: 'Phone',
               description: 'Smartphone',
               price: '599.99',
               imageUrl: 'http://img.com/phone',
               stock: 10,
               categoryID: electronicsId,
            }),
            expect.objectContaining({
               name: 'Laptop',
               description: 'Powerful laptop',
               price: '999.99',
               imageUrl: 'http://img.com/laptop',
               stock: 5,
               categoryID: electronicsId,
            }),
            expect.objectContaining({
               name: 'Book',
               description: 'Interesting book',
               price: '19.99',
               imageUrl: 'http://img.com/book',
               stock: 100,
               categoryID: booksId,
            }),
         ])
      );
   });
});

// /************************************** get */
describe('get', () => {
   test('gets a product by id', async () => {
      const phoneRes = await db.query(
         `SELECT id FROM products WHERE name = 'Phone'`
      );
      const phoneId = phoneRes.rows[0].id;

      const product = await Product.get(phoneId);
      expect(product).toEqual(
         expect.objectContaining({
            id: phoneId,
            name: 'Phone',
            description: 'Smartphone',
            price: '599.99',
            imageUrl: 'http://img.com/phone',
            stock: 10,
            categoryID: electronicsId,
         })
      );
   });

   test('throws NotFoundError if product not found', async () => {
      await expect(Product.get(999999)).rejects.toThrow(NotFoundError);
   });
});

// /************************************** update */
describe('update', () => {
   test('updates product fields', async () => {
      const laptopRes = await db.query(
         `SELECT id FROM products WHERE name = 'Laptop'`
      );
      const laptopId = laptopRes.rows[0].id;

      const updateData = {
         name: 'Updated Laptop',
         description: 'Updated powerful laptop',
         price: '1200.00',
         imageUrl: 'http://img.com/updatedlaptop',
         stock: 3,
         categoryID: electronicsId,
      };

      const updated = await Product.update(laptopId, updateData);
      expect(updated).toEqual(
         expect.objectContaining({
            id: laptopId,
            ...updateData,
         })
      );
   });

   test('throws NotFoundError if product not found', async () => {
      await expect(Product.update(999999, { name: 'NoProd' })).rejects.toThrow(
         NotFoundError
      );
   });
});

// /************************************** remove */
describe('remove', () => {
   test('removes a product', async () => {
      const bookRes = await db.query(
         `SELECT id FROM products WHERE name = 'Book'`
      );
      const bookId = bookRes.rows[0].id;

      await Product.remove(bookId);
      await expect(Product.get(bookId)).rejects.toThrow(NotFoundError);
   });

   test('throws NotFoundError if product not found', async () => {
      await expect(Product.remove(999999)).rejects.toThrow(NotFoundError);
   });
});
