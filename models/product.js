'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for products. */
class Product {
   /** Create a product (from data), update db, return new product data.
    *
    * data should be { id, name, description, price, image_url, stock, category_id }
    *
    * Returns { name, description, price, image_url, stock, category_id }
    *
    * Throws BadRequestError if product already in database.
    *
    * */
   //FIN: working
   static async create({
      id,
      name,
      description,
      price,
      image_url,
      stock,
      category_id,
   }) {
      const duplicateCheck = await db.query(
         `SELECT id
           FROM products
           WHERE id = $1`,
         [id]
      );

      if (duplicateCheck.rows[0])
         throw new BadRequestError(`Duplicate product: ${id}`);

      const result = await db.query(
         `INSERT INTO products
           (name, description, price, image_url, stock, category_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, name, description, price, image_url AS "imageUrl", stock, category_id AS "categoryID"`,
         [name, description, price, image_url, stock, category_id]
      );
      const product = result.rows[0];

      return product;
   }

   /** Find all products.
    *
    * Returns [{ id, name, description, price, image_url, stock, category_id }, ...]
    * */
   //FIN: working
   static async findAll() {
      let result = await db.query(`SELECT id,
                        name,
                        description,
                        price,
                        image_url AS "imageUrl",
                        stock,
                        category_id AS "categoryID"
                  FROM products`);

      return result.rows;
   }

   /** Return product data about via id.
    *
    * Returns { id, name, description, price, image_url, stock, category_id }
    *
    * Throws NotFoundError if not found.
    **/
   //FIN: working
   static async get(id) {
      const productRes = await db.query(
         `SELECT id,
                  name,
                  description,
                  price,
                  image_url AS "imageUrl",
                  stock,
                  category_id AS "categoryID"
            FROM products
            WHERE id = $1`,
         [id]
      );

      const product = productRes.rows[0];

      if (!product) throw new NotFoundError(`No product: ${id}`);

      return product;
   }

   /** Update product data with `data`.
    *
    * This is a "partial update" --- it's fine if data doesn't contain all the
    * fields; this only changes provided ones.
    *
    * Data can include: { name, description, price, image_url, stock, category_id }
    *
    * Returns { id, name, description, price, image_url, stock, category_id }
    *
    * Throws NotFoundError if not found.
    */
   //FIN: works
   static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(data, {
         name: 'name',
         description: 'description',
         price: 'price',
         imageUrl: 'image_url',
         stock: 'stock',
         categoryID: 'category_id',
      });
      const handleVarIdx = '$' + (values.length + 1);

      const querySql = `UPDATE products 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                name, 
                                description, 
                                price,
                                image_url AS "imageUrl",
                                stock,
                                category_id AS "categoryID"`;
      const result = await db.query(querySql, [...values, id]);
      const product = result.rows[0];

      if (!product) throw new NotFoundError(`No product: ${id}`);

      return product;
   }

   /** Delete a given product from DB; returns id.
    *
    * Throws NotFoundError if product not found.
    **/
   //FIN: works
   static async remove(id) {
      const result = await db.query(
         `DELETE
           FROM products
           WHERE id = $1
           RETURNING id`,
         [id]
      );
      const product = result.rows[0];

      if (!product) throw new NotFoundError(`No product: ${id}`);
   }
}

module.exports = Product;
