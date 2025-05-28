'use strict';

/** Routes for carts. */

const jsonschema = require('jsonschema');

const express = require('express');
// const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require('../expressError');
const Order = require('../models/order');
const orderNewSchema = require('../schemas/orderNew.json');
const orderUpdateSchema = require('../schemas/orderUpdate.json');

const router = express.Router();

/** POST / { cart }  => { cart }
 *
 * Adds a new category and returns the category data
 *
 *  {cart: { id, username } }
 *
 * Authorization required: admin
 **/

// router.post('/', ensureAdmin, async function (req, res, next) {
//FIN:
router.post('/', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, orderNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }
      const order = await Order.create(req.body);
      return res.status(201).json({ order });
   } catch (err) {
      return next(err);
   }
});

/** GET / => { cart: [ { id, username } ] }
 *
 * Returns a list of all carts.
 *
 * Authorization required: admin
 **/

// router.get('/', ensureAdmin, async function (req, res, next) {
//FIN:
router.get('/', async function (req, res, next) {
   try {
      const orders = await Order.findAll();
      return res.json({ orders });
   } catch (err) {
      return next(err);
   }
});

/** GET /[id] => { category }
 *
 * Returns a cart { id, name }
 *
 * Authorization required: admin or same user-as-:username
 **/

// router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN:
router.get('/:id', async function (req, res, next) {
   try {
      const order = await Order.get(req.params.id);
      return res.json({ order });
   } catch (err) {
      return next(err);
   }
});

/** GET /[id] => { category }
 *
 * Returns a cart { id, name }
 *
 * Authorization required: admin or same user-as-:username
 **/

// router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN:
router.get('/username/:username', async function (req, res, next) {
   try {
      const orders = await Order.getAllOrdersForUser(req.params.username);
      return res.json({ orders });
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
//TODO: never going to be editing an order
router.patch('/:id', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, orderUpdateSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const order = await Order.update(req.params.id, req.body);
      return res.json({ order });
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
      await Order.remove(req.params.id);
      return res.json({ deleted: req.params.id });
   } catch (err) {
      return next(err);
   }
});

module.exports = router;
