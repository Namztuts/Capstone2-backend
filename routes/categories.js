'use strict';

/** Routes for categories. */

const jsonschema = require('jsonschema');

const express = require('express');
// const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require('../expressError');
const Categories = require('../models/categories');
const categoriesNewSchema = require('../schemas/categoriesNew.json');

const router = express.Router();

/** POST / { category }  => { category }
 *
 * Adds a new category and returns the category data
 *
 *  {category: { id, name } }
 *
 * Authorization required: admin
 **/

// router.post('/', ensureAdmin, async function (req, res, next) {
//FIN: works
router.post('/', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, categoriesNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const category = await Categories.create(req.body);
      return res.status(201).json({ category });
   } catch (err) {
      return next(err);
   }
});

/** GET / => { category: [ { id, name } ] }
 *
 * Returns a list of all categories.
 *
 * Authorization required: admin
 **/

// router.get('/', ensureAdmin, async function (req, res, next) {
//FIN: works
router.get('/', async function (req, res, next) {
   try {
      const categories = await Categories.findAll();
      return res.json({ categories });
   } catch (err) {
      return next(err);
   }
});

/** GET /[id] => { category }
 *
 * Returns { id, name }
 *
 * Authorization required: admin or same user-as-:username
 **/

// router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN: works
router.get('/:id', async function (req, res, next) {
   try {
      const category = await Categories.get(req.params.id);
      return res.json({ category });
   } catch (err) {
      return next(err);
   }
});

/** GET /[id] => { cart_items }
 *
 * Returns a cart and all the items { cart_items: [ { id, cart_id, product_id, quantity } ] }
 *
 * Authorization required: admin or same user-as-:username
 **/

// router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN:
router.get('/:id/products', async function (req, res, next) {
   try {
      const category = await Categories.get(req.params.id); //get category info

      if (!category) {
         return res.status(404).json({ error: 'Category not found' });
      }

      const items = await Categories.getProductsByCategory(req.params.id); //get order items

      //combine for our response
      const response = {
         category: {
            ...category,
            items,
         },
      };

      return res.json(response);
   } catch (err) {
      return next(err);
   }
});

/** PATCH /[id] { category } => { category }
 *
 * Data can include:
 *   { name }
 *
 * Returns { id, name }
 *
 * Authorization required: admin or same-user-as-:username
 **/

// router.patch('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN: works
//NOTE: not sure where we are gonna get the id when actually updating on frontend
router.patch('/:id', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, categoriesNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const category = await Categories.update(req.params.id, req.body);
      return res.json({ category });
   } catch (err) {
      return next(err);
   }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: admin or same-user-as-:username
 **/

// router.delete('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN:
router.delete('/:id', async function (req, res, next) {
   try {
      await Categories.remove(req.params.id);
      return res.json({ deleted: req.params.id });
   } catch (err) {
      return next(err);
   }
});

module.exports = router;
