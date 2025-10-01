'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for cart items. */
class CartItem {
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
   static async add({ cart_id, product_id, quantity }) {
      const duplicateCheck = await db.query(
         `SELECT id FROM cart_items
       WHERE cart_id = $1 AND product_id = $2`,
         [cart_id, product_id]
      );

      //if an item is added that already exists, increment the quantity
      if (duplicateCheck.rows[0]) {
         const updated = await db.query(
            `UPDATE cart_items
               SET quantity = quantity + $1
               WHERE cart_id = $2 AND product_id = $3
               RETURNING id, cart_id AS "cartID", product_id AS "productID", quantity`,
            [quantity, cart_id, product_id]
         );

         return updated.rows[0];
      }

      const result = await db.query(
         `INSERT INTO cart_items 
            (cart_id, product_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING id, cart_id AS "cartID", product_id AS "productID", quantity`,
         [cart_id, product_id, quantity]
      );

      return result.rows[0];
   }

   /** Find all categories.
    *
    * Returns [ { id, name } ]
    * */
   //FIN:
   static async findAll() {
      let result = await db.query(`SELECT *
                                 FROM cart_items`);

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
      const response = await db.query(
         `SELECT *
            FROM cart_items
            WHERE id = $1`,
         [id]
      );

      const cart_item = response.rows[0];

      if (!cart_item) throw new NotFoundError(`No cart item: ${id}`);

      return cart_item;
   }

   /** Return a cart and all its items via cart_id. JOIN with products table for all info on product
    *
    * Returns { cart_item_id, cart_id, product_id, quantity }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN:
   static async getAllByCartID(cart_id) {
      const results = await db.query(
         `SELECT
            ci.cart_id,
            ci.id AS cart_item_id,
            ci.quantity,
            p.id AS product_id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            p.stock,
            p.category_id
         FROM cart_items AS ci
         JOIN products AS p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
         [cart_id]
      );

      const cart_with_items = results.rows;

      if (!cart_with_items)
         throw new NotFoundError(`No cart found: ${cart_id}`);

      if (cart_with_items.length === 0) return [];

      return cart_with_items;
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

      const querySql = `UPDATE cart_items
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, cart_id AS "cartID", product_id AS "productID", quantity`;
      const result = await db.query(querySql, [...values, id]);
      const cart_items = result.rows[0];

      if (!cart_items) throw new NotFoundError(`No cart items found: ${id}`);

      return cart_items;
   }

   /** Delete given category from database; returns undefined.
    *
    * Throws NotFoundError if category not found.
    **/
   //FIN:
   static async remove(id) {
      const result = await db.query(
         `DELETE
           FROM cart_items
           WHERE id = $1
           RETURNING id`,
         [id]
      );
      const cart_item = result.rows[0];

      if (!cart_item) throw new NotFoundError(`No cart item: ${id}`);
   }

   /** Delete given category from database; returns undefined.
    *
    * Throws NotFoundError if category not found.
    **/
   //FIN:
   static async clearCartItems(cart_id) {
      const result = await db.query(
         `DELETE
           FROM cart_items
           WHERE cart_id = $1
           RETURNING id`,
         [cart_id]
      );
      const cart = result.rows[0];

      if (!cart)
         throw new NotFoundError(`No cart items to clear for cart: ${cart_id}`);
   }
}

module.exports = CartItem;
