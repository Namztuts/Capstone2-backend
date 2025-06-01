'use strict';

const db = require('../db');
const Categories = require('../models/categories');
const { BadRequestError, NotFoundError } = require('../expressError');
const {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
} = require('./_testCommon');

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
describe('create', () => {
   test('creates a new category successfully', async () => {
      const newCategory = { name: 'Toys' };
      const category = await Categories.create(newCategory);
      expect(category).toEqual(
         expect.objectContaining({
            id: expect.any(Number),
            name: 'Toys',
         })
      );

      // Verify it is actually in DB
      const result = await db.query(
         'SELECT name FROM categories WHERE id = $1',
         [category.id]
      );
      expect(result.rows[0]).toEqual({ name: 'Toys' });
   });

   test('throws BadRequestError on duplicate name', async () => {
      await expect(Categories.create({ name: 'Electronics' })).rejects.toThrow(
         BadRequestError
      );
   });
});

/************************************** findAll */
describe('findAll', () => {
   test('finds all categories', async () => {
      const categories = await Categories.findAll();
      expect(categories).toEqual(
         expect.arrayContaining([
            expect.objectContaining({ id: electronicsId, name: 'Electronics' }),
            expect.objectContaining({ id: booksId, name: 'Books' }),
            expect.objectContaining({ name: 'Clothing' }), // clothingId included implicitly
         ])
      );
   });
});

/************************************** get */
describe('get', () => {
   test('gets a category by id', async () => {
      const category = await Categories.get(electronicsId);
      expect(category).toEqual({
         id: electronicsId,
         name: 'Electronics',
      });
   });

   test('throws NotFoundError if category not found', async () => {
      await expect(Categories.get(0)).rejects.toThrow(NotFoundError);
   });
});

// /************************************** getProductsByCategory */
describe('getProductsByCategory', () => {
   test('returns products for a given category', async () => {
      const products = await Categories.getProductsByCategory(electronicsId);

      expect(products.length).toBeGreaterThanOrEqual(2);
      expect(products).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               name: 'Phone',
               category_id: electronicsId,
            }),
            expect.objectContaining({
               name: 'Laptop',
               category_id: electronicsId,
            }),
         ])
      );
   });

   test('returns empty array if no products for category', async () => {
      // Assuming clothingId has no products in _testCommon setup
      const products = await Categories.getProductsByCategory(clothingId);
      expect(products).toEqual([]);
   });
});

// /************************************** update */
describe('update', () => {
   test('updates category name', async () => {
      const updated = await Categories.update(electronicsId, {
         name: 'Gadgets',
      });
      expect(updated).toEqual({
         id: electronicsId,
         name: 'Gadgets',
      });

      // Verify persisted in DB
      const res = await db.query('SELECT name FROM categories WHERE id = $1', [
         electronicsId,
      ]);
      expect(res.rows[0]).toEqual({ name: 'Gadgets' });
   });

   test('throws NotFoundError if category not found', async () => {
      await expect(Categories.update(0, { name: 'Nope' })).rejects.toThrow(
         NotFoundError
      );
   });
});

// /************************************** remove */
describe('remove', () => {
   test('removes a category', async () => {
      await Categories.remove(clothingId);
      const res = await db.query('SELECT id FROM categories WHERE id = $1', [
         clothingId,
      ]);
      expect(res.rows.length).toBe(0);
   });

   test('throws NotFoundError if category not found', async () => {
      await expect(Categories.remove(0)).rejects.toThrow(NotFoundError);
   });
});
