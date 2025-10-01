'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for cart items. */
class OrderItem {
   /** Create a cart (from data), update db, return new category data.
    *
    * data should be { name }
    *
    * Returns { id, name  }
    *
    * Throws BadRequestError if product already in database.
    *
    * */
   //FIN:
   static async add({ order_id, product_id, quantity, price_at_purchase }) {
      const result = await db.query(
         `INSERT INTO order_items 
            (order_id, product_id, quantity, price_at_purchase)
            VALUES ($1, $2, $3, $4)
            RETURNING id, order_id AS "orderID", product_id AS "productID", quantity, price_at_purchase AS "pricePurchased"`,
         [order_id, product_id, quantity, price_at_purchase]
      );

      return result.rows[0];
   }

   /** Create a cart (from data), update db, return new category data.
    *
    * data should be { name }
    *
    * Returns { id, name  }
    *
    * Throws BadRequestError if product already in database.
    *
    * */
   //FIN:
   static async addBulk(orderItems) {
      if (!orderItems || orderItems.length === 0) return [];

      const values = [];
      const placeholders = [];

      orderItems.forEach((item, idx) => {
         const baseIndex = idx * 4;
         values.push(
            item.order_id,
            item.product_id,
            item.quantity,
            item.price_at_purchase
         );
         placeholders.push(
            `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
               baseIndex + 4
            })`
         );
      });

      const result = await db.query(
         `INSERT INTO order_items 
            (order_id, product_id, quantity, price_at_purchase)
            VALUES ${placeholders.join(', ')}
            ON CONFLICT (order_id, product_id) DO NOTHING
            RETURNING id, order_id AS "orderID", product_id AS "productID", quantity, price_at_purchase AS "pricePurchased"`,
         values
      );
      return result.rows;
   }

   /** Find all categories.
    *
    * Returns [ { id, name } ]
    * */
   //FIN:
   static async findAll() {
      let result = await db.query(`SELECT *
                                 FROM order_items`);

      return result.rows;
   }

   /** Return a cart item via id.
    *
    * Returns { id, cart_id, product_id, quantity }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN:
   static async get(id) {
      const result = await db.query(
         `SELECT *
            FROM order_items
            WHERE id = $1`,
         [id]
      );

      const order_item = result.rows[0];

      if (!order_item) throw new NotFoundError(`No order item: ${id}`);

      return order_item;
   }

   /** Return a cart and all its items via cart_id. JOIN with products table for all info on product
    *
    * Returns { cart_item_id, cart_id, product_id, quantity }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN:
   static async getAllByOrderID(order_id) {
      const results = await db.query(
         `SELECT
            oi.order_id,
            oi.id AS order_item_id,
            oi.quantity,
            p.id AS product_id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            p.stock,
            p.category_id
         FROM order_items AS oi
         JOIN products AS p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
         [order_id]
      );

      const order_with_items = results.rows;

      if (order_with_items.length === 0)
         throw new NotFoundError(`No items found for order: ${order_id}`);

      if (order_with_items.length === 0) return [];

      return order_with_items;
   }

   /** Update category data with `data`.
    *
    * This is a "partial update" --- it's fine if data doesn't contain all the
    * fields; this only changes provided ones.
    *
    * Data can include: { name }
    *
    * Returns { id, name }
    *
    * Throws NotFoundError if not found.
    */
   //FIN:
   static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(data, {
         id: 'id',
      });
      const handleVarIdx = '$' + (values.length + 1);

      const querySql = `UPDATE order_items
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, order_id AS "orderID", product_id AS "productID", quantity, price_at_purchase AS "pricePurchased"`;
      const result = await db.query(querySql, [...values, id]);
      const order_items = result.rows[0];

      if (!order_items) throw new NotFoundError(`No order items found: ${id}`);

      return order_items;
   }

   /** Delete given category from database; returns undefined.
    *
    * Throws NotFoundError if category not found.
    **/
   //FIN:
   static async remove(id) {
      const result = await db.query(
         `DELETE
           FROM order_items
           WHERE id = $1
           RETURNING id`,
         [id]
      );
      const order_item = result.rows[0];

      if (!order_item) throw new NotFoundError(`No order item: ${id}`);
   }
}

module.exports = OrderItem;
