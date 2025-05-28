'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for carts. */
class Cart {
   /** Create a cart (from data), update db, return new category data.
    *
    * data should be { name }
    *
    * Returns { id, name  }
    *
    * Throws BadRequestError if product already in database.
    *
    * */
   //FIN: cart created upon creating a newuser | so we don't use this
   static async create({ username }) {
      const duplicateCheck = await db.query(
         `SELECT username
           FROM carts
           WHERE username = $1`,
         [username]
      );

      if (duplicateCheck.rows[0])
         throw new BadRequestError(`Duplicate cart for user: ${username}`);

      const result = await db.query(
         `INSERT INTO carts
           (username)
           VALUES ($1)
           RETURNING id, username`,
         [username]
      );
      const cart = result.rows[0];

      return cart;
   }

   /** Find all categories.
    *
    * Returns [ { id, name } ]
    * */
   //FIN:
   static async findAll() {
      let result = await db.query(`SELECT id, username
                                 FROM carts`);

      return result.rows;
   }

   /** Return a category via id.
    *
    * Returns { id, name }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN: for initially retrieving the cart
   static async get(username) {
      const cartRes = await db.query(
         `SELECT id,
                  username
            FROM carts
            WHERE username = $1`,
         [username]
      );

      const cart = cartRes.rows[0];

      if (!cart) throw new NotFoundError(`No cart: ${username}`);

      return cart;
   }

   /** Return a category via id.
    *
    * Returns { id, name }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN: for our gte cart and all items
   static async getByID(id) {
      const cartRes = await db.query(
         `SELECT id,
                  username
            FROM carts
            WHERE id = $1`,
         [id]
      );

      const cart = cartRes.rows[0];

      if (!cart) throw new NotFoundError(`No cart: ${id}`);

      return cart;
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
   //TODO: can't update cart due to it depending on the username from users
   static async update(username, data) {
      const { setCols, values } = sqlForPartialUpdate(data, {
         username: 'username',
      });
      const handleVarIdx = '$' + (values.length + 1);

      const querySql = `UPDATE carts
                      SET ${setCols} 
                      WHERE username = ${handleVarIdx} 
                      RETURNING id, 
                                username`;
      const result = await db.query(querySql, [...values, username]);
      const cart = result.rows[0];

      if (!cart) throw new NotFoundError(`No cart: ${id}`);

      return cart;
   }

   /** Delete given category from database; returns undefined.
    *
    * Throws NotFoundError if category not found.
    **/
   //FIN:
   static async remove(username) {
      const result = await db.query(
         `DELETE
           FROM carts
           WHERE username = $1
           RETURNING id`,
         [username]
      );
      const cart = result.rows[0];

      if (!cart) throw new NotFoundError(`No cart: ${username}`);
   }
}

module.exports = Cart;
