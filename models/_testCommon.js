'use strict';

const bcrypt = require('bcrypt');
const db = require('../db.js');
const { BCRYPT_WORK_FACTOR } = require('../config');

async function commonBeforeAll() {
   // Delete in dependency order to avoid FK constraint issues
   await db.query('DELETE FROM order_items');
   await db.query('DELETE FROM cart_items');
   await db.query('DELETE FROM orders');
   await db.query('DELETE FROM carts');
   await db.query('DELETE FROM products');
   await db.query('DELETE FROM categories');
   await db.query('DELETE FROM users');

   // Insert users
   await db.query(
      `
    INSERT INTO users (username, password, first_name, last_name, email, is_admin)
    VALUES 
      ('u1', $1, 'U1F', 'U1L', 'user1@email.com', false),
      ('u2', $2, 'U2F', 'U2L', 'user2@email.com', false)
  `,
      [
         await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
         await bcrypt.hash('password2', BCRYPT_WORK_FACTOR),
      ]
   );

   // Insert categories
   await db.query(`
          INSERT INTO categories (name)
          VALUES ('Electronics'), ('Books'), ('Clothing')
        `);

   // Get category IDs
   const categoriesRes = await db.query(`SELECT id, name FROM categories`);
   const electronicsId = categoriesRes.rows.find(
      (c) => c.name === 'Electronics'
   ).id;
   const booksId = categoriesRes.rows.find((c) => c.name === 'Books').id;
   const clothingId = categoriesRes.rows.find((c) => c.name === 'Clothing').id;

   // Insert products
   await db.query(
      `
          INSERT INTO products (name, description, price, image_url, stock, category_id)
          VALUES
            ('Phone', 'Smartphone', 599.99, 'http://img.com/phone', 10, $1),
            ('Laptop', 'Powerful laptop', 999.99, 'http://img.com/laptop', 5, $1),
            ('Book', 'Interesting book', 19.99, 'http://img.com/book', 100, $2)
        `,
      [electronicsId, booksId]
   );

   // Create carts for users
   await db.query(`
          INSERT INTO carts (username)
          VALUES ('u1'), ('u2')
        `);

   // Get cart IDs
   const cartsRes = await db.query(`SELECT id, username FROM carts`);
   const u1CartId = cartsRes.rows.find((c) => c.username === 'u1').id;
   const u2CartId = cartsRes.rows.find((c) => c.username === 'u2').id;

   // Get product IDs
   const productsRes = await db.query(`SELECT id, name, price FROM products`);
   const phone = productsRes.rows.find((p) => p.name === 'Phone');
   const laptop = productsRes.rows.find((p) => p.name === 'Laptop');
   const book = productsRes.rows.find((p) => p.name === 'Book');

   // Insert cart items
   await db.query(
      `
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES
      ($1, $2, 1),
      ($3, $4, 2),
      ($5, $6, 1)
  `,
      [u1CartId, phone.id, u1CartId, laptop.id, u2CartId, book.id]
   );

   // Insert orders
   await db.query(`
       INSERT INTO orders (username, total)
       VALUES
         ('u1', 1199.98),
         ('u2', 19.99)
     `);

   // Get order IDs
   const ordersRes = await db.query(`SELECT id, username FROM orders`);
   const u1OrderId = ordersRes.rows.find((o) => o.username === 'u1').id;
   const u2OrderId = ordersRes.rows.find((o) => o.username === 'u2').id;

   // // Insert order items
   await db.query(
      `
    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES
      ($1, $2, 1, 599.99),
      ($3, $4, 1, 599.99),
      ($5, $6, 1, 19.99)
  `,
      [u1OrderId, phone.id, u1OrderId, laptop.id, u2OrderId, book.id]
   );
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

module.exports = {
   commonBeforeAll,
   commonBeforeEach,
   commonAfterEach,
   commonAfterAll,
};
