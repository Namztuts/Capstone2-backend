'use strict';

/** Routes for products. */

const jsonschema = require('jsonschema');

const express = require('express');
// const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require('../expressError');
const Product = require('../models/product');
const productNewSchema = require('../schemas/productNew.json');
const productUpdateSchema = require('../schemas/productUpdate.json');

const router = express.Router();

/** POST / { product }  => { product }
 *
 * Adds a new product and returns the product data
 *
 *  {product: { id, name, description, price, image_url, stock, category_id } }
 *
 * Authorization required: admin
 **/

// router.post('/', ensureAdmin, async function (req, res, next) {
//FIN: works
router.post('/', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, productNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const product = await Product.create(req.body);
      return res.status(201).json({ product });
   } catch (err) {
      return next(err);
   }
});

/** GET / => { products: [ {id, name, description, price, image_url, stock, category_id } ] }
 *
 * Returns a list of all products.
 *
 * Authorization required: admin
 **/

// router.get('/', ensureAdmin, async function (req, res, next) {
//FIN: works
router.get('/', async function (req, res, next) {
   try {
      const products = await Product.findAll();
      return res.json({ products });
   } catch (err) {
      return next(err);
   }
});

/** GET /[id] => { product }
 *
 * Returns { id, name, description, price, image_url, stock, category_id }
 *
 * Authorization required: admin or same user-as-:username
 **/

// router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN: works
router.get('/:id', async function (req, res, next) {
   try {
      const product = await Product.get(req.params.id);
      return res.json({ product });
   } catch (err) {
      return next(err);
   }
});

/** PATCH /[id] { product } => { product }
 *
 * Data can include:
 *   { name, description, price, image_url, stock, category_id }
 *
 * Returns { id, name, description, price, image_url, stock, category_id }
 *
 * Authorization required: admin or same-user-as-:username
 **/

// router.patch('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN: works
router.patch('/:id', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, productUpdateSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const product = await Product.update(req.params.id, req.body);
      return res.json({ product });
   } catch (err) {
      return next(err);
   }
});

/** DELETE /[product]  =>  { deleted: product }
 *
 * Authorization required: admin or same-user-as-:username
 **/

// router.delete('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN: works
router.delete('/:id', async function (req, res, next) {
   try {
      await Product.remove(req.params.id);
      return res.json({ deleted: req.params.id });
   } catch (err) {
      return next(err);
   }
});

module.exports = router;
