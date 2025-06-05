'use strict';

const db = require('../db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { createToken } = require('../helpers/tokens');

async function createAdminToken() {
   // Create an admin token for testing
   const admin = { username: 'admin', isAdmin: true };
   return createToken(admin);
}

async function createUserToken() {
   // Create a non-admin user token for testing
   const user = { username: 'testuser', isAdmin: false };
   return createToken(user);
}

const testUsers = [
   {
      username: 'admin',
      password: 'adminpass',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      is_admin: true,
   },
   {
      username: 'user1',
      password: 'password1',
      first_name: 'User',
      last_name: 'One',
      email: 'user1@example.com',
      is_admin: false,
   },
   {
      username: 'testuser',
      password: 'password',
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser@example.com',
      is_admin: false,
   },
];

const testCategories = [
   { id: 1, name: 'Electronics' },
   { id: 2, name: 'Books' },
   { id: 3, name: 'Clothing' },
];

const testProducts = [
   {
      id: 1,
      name: 'Phone',
      description: 'Smartphone with 4GB RAM',
      price: 299.99,
      image_url: 'http://example.com/phone.jpg',
      stock: 10,
      category_id: 1,
   },
   {
      id: 2,
      name: 'Novel',
      description: 'Bestselling book',
      price: 15.99,
      image_url: 'http://example.com/book.jpg',
      stock: 100,
      category_id: 2,
   },
];

const testCarts = [
   { id: 1, username: 'admin' },
   { id: 2, username: 'user1' },
   { id: 3, username: 'testuser' },
];

async function commonBeforeAll() {
   await db.query('DELETE FROM users');
   await db.query('DELETE FROM products');
   await db.query('DELETE FROM categories');
   await db.query('DELETE FROM order_items');
   await db.query('DELETE FROM orders');

   await db.query(`
  INSERT INTO categories (id, name)
  VALUES
    (1, 'Electronics'),
    (2, 'Books'),
    (3, 'Clothing')
`);

   for (let user of testUsers) {
      const hashed = await bcrypt.hash(user.password, BCRYPT_WORK_FACTOR);
      await db.query(
         `INSERT INTO users (username, password, first_name, last_name, email, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6)`,
         [
            user.username,
            hashed,
            user.first_name,
            user.last_name,
            user.email,
            user.is_admin,
         ]
      );
   }

   for (let i = 0; i < testProducts.length; i++) {
      const p = testProducts[i];
      const result = await db.query(
         `INSERT INTO products (name, description, price, image_url, stock, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
         [p.name, p.description, p.price, p.image_url, p.stock, p.category_id]
      );
      testProducts[i] = {
         id: result.rows[0].id,
         name: p.name,
         description: p.description,
         price: p.price,
         imageUrl: p.image_url,
         stock: p.stock,
         categoryID: p.category_id,
      };
   }

   for (let cart of testCarts) {
      await db.query(
         `INSERT INTO carts (id, username)
       VALUES ($1, $2)`,
         [cart.id, cart.username]
      );
   }
}

async function commonBeforeEach() {
   await db.query('BEGIN');
}

async function commonAfterEach() {
   await db.query('ROLLBACK');
}

async function commonAfterAll() {
   await db.end();
}

module.exports.testProducts = testProducts;
module.exports.testCarts = testCarts;

module.exports = {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
   testUsers,
   testProducts,
   testCategories,
   testCarts,
   createAdminToken,
   createUserToken,
};
