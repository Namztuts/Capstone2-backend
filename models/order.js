'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for carts. */
class Order {
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
   static async create({ username, total }) {
      const result = await db.query(
         `INSERT INTO orders
           (username, total)
           VALUES ($1, $2)
           RETURNING id, username, total`,
         [username, total]
      );

      const order = result.rows[0];

      return order;
   }

   /** Find all orders.
    *
    * Returns [ { id, name } ]
    * */
   //FIN:
   static async findAll() {
      let result = await db.query(`SELECT *
                                 FROM orders`);

      return result.rows;
   }

   /** Return a category via id.
    *
    * Returns { id, name }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN:
   static async get(id) {
      const result = await db.query(
         `SELECT *
            FROM orders
            WHERE id = $1`,
         [id]
      );

      const order = result.rows[0];

      if (!order) throw new NotFoundError(`No order: ${id}`);

      return order;
   }

   /** Return a category via id.
    *
    * Returns { id, name }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN:
   static async getAllOrdersForUser(username) {
      const result = await db.query(
         `SELECT *
            FROM orders
            WHERE username = $1`,
         [username]
      );

      const order = result.rows;

      if (!order) throw new NotFoundError(`No orders for: ${username}`);

      return order;
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
   //TODO: never going to be updating the orders
   static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(data, {
         total: 'total',
      });
      const handleVarIdx = '$' + (values.length + 1);

      const querySql = `UPDATE orders
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING *`;
      const result = await db.query(querySql, [...values, id]);
      const order = result.rows[0];

      if (!order) throw new NotFoundError(`No order: ${id}`);

      return order;
   }

   /** Delete given category from database; returns undefined.
    *
    * Throws NotFoundError if category not found.
    **/
   //FIN:
   static async remove(id) {
      const result = await db.query(
         `DELETE
           FROM orders
           WHERE id = $1
           RETURNING id`,
         [id]
      );
      const order = result.rows[0];

      if (!order) throw new NotFoundError(`No order: ${id}`);
   }
}

module.exports = Order;
