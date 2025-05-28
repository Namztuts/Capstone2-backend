'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for categories. */
class Categories {
   /** Create a category (from data), update db, return new category data.
    *
    * data should be { name }
    *
    * Returns { id, name  }
    *
    * Throws BadRequestError if product already in database.
    *
    * */
   //FIN: works
   static async create({ id, name }) {
      const duplicateCheck = await db.query(
         `SELECT id
           FROM categories
           WHERE id = $1`,
         [id]
      );

      if (duplicateCheck.rows[0])
         throw new BadRequestError(`Duplicate category: ${id}`);

      const result = await db.query(
         `INSERT INTO categories
           (name)
           VALUES ($1)
           RETURNING id, name`,
         [name]
      );
      const category = result.rows[0];

      return category;
   }

   /** Find all categories.
    *
    * Returns [ { id, name } ]
    * */
   //FIN: works
   static async findAll() {
      let result = await db.query(`SELECT id, name
                                 FROM categories`);

      return result.rows;
   }

   /** Return a category via id.
    *
    * Returns { id, name }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN: works
   static async get(id) {
      const categoryRes = await db.query(
         `SELECT id,
                  name
            FROM categories
            WHERE id = $1`,
         [id]
      );

      const category = categoryRes.rows[0];

      if (!category) throw new NotFoundError(`No category: ${id}`);

      return category;
   }

   /** Find all items in a specific category.
    *
    * Returns [ { id, name } ]
    * */
   //FIN:
   static async getProductsByCategory(id) {
      let result = await db.query(
         `SELECT *
            FROM products
            WHERE category_id = $1`,
         [id]
      );

      return result.rows;
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
   //FIN: works
   static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(data, {
         name: 'name',
      });
      const handleVarIdx = '$' + (values.length + 1);

      const querySql = `UPDATE categories 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                name`;
      const result = await db.query(querySql, [...values, id]);
      const category = result.rows[0];

      if (!category) throw new NotFoundError(`No category: ${id}`);

      return category;
   }

   /** Delete given category from database; returns undefined.
    *
    * Throws NotFoundError if category not found.
    **/
   //FIN:
   static async remove(id) {
      const result = await db.query(
         `DELETE
           FROM categories
           WHERE id = $1
           RETURNING id`,
         [id]
      );
      const category = result.rows[0];

      if (!category) throw new NotFoundError(`No category: ${id}`);
   }
}

module.exports = Categories;
