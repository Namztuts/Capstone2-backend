'use strict';

/** Routes for carts. */

const jsonschema = require('jsonschema');

const express = require('express');
// const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require('../expressError');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const cartNewSchema = require('../schemas/cartNew.json');

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
//FIN: route not used due to this being created when user is created
router.post('/', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, cartNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const cart = await Cart.create(req.body);
      return res.status(201).json({ cart });
   } catch (err) {
      console.error('POST /carts ERROR:', err);
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
////FIN:
router.get('/', async function (req, res, next) {
   try {
      const carts = await Cart.findAll();
      return res.json({ carts });
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
//FIN: accepts both id and username???
router.get('/:username', async function (req, res, next) {
   try {
      const cart = await Cart.get(req.params.username);
      return res.json({ cart });
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
//FIN:
router.patch('/:username', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, cartNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const cart = await Cart.update(req.params.username, req.body);
      return res.json({ cart });
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
router.delete('/:username', async function (req, res, next) {
   try {
      await Cart.remove(req.params.username);
      return res.json({ deleted: req.params.username });
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
router.delete('/:cartID/items', async function (req, res, next) {
   try {
      await CartItem.clearCartItems(req.params.cartID);
      return res.json({ deleted: req.params.cartID });
   } catch (err) {
      return next(err);
   }
});

module.exports = router;
