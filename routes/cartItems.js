'use strict';

/** Routes for cart items. */

const jsonschema = require('jsonschema');

const express = require('express');
const { ensureLoggedIn } = require('../middleware/auth');
const { BadRequestError } = require('../expressError');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const cartItemNewSchema = require('../schemas/cartItemNew.json');
const cartItemUpdateSchema = require('../schemas/cartItemUpdate.json');

const router = express.Router();

/** POST / { cart }  => { cart }
 *
 * Adds a new cart item and returns the cart item data
 *
 *  {cart: { id, username } }
 *
 * Authorization required: admin
 **/

router.post('/', ensureLoggedIn, async function (req, res, next) {
   //TODO: testing if this works; throws an error but want it to prevent the message popping up saying 'added to cart'
   // router.post('/', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, cartItemNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const cart_item = await CartItem.add(req.body);
      return res.status(201).json({ cart_item });
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
      const cart_items = await CartItem.findAll();
      return res.json({ cart_items });
   } catch (err) {
      return next(err);
   }
});

/** GET /[id] => { cart_item }
 *
 * Returns a cart_item { id, cart_id, product_id, quantity }
 *
 * Authorization required: admin or same user-as-:username
 **/

// router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
//FIN:
router.get('/:id', async function (req, res, next) {
   try {
      const cart_item = await CartItem.get(req.params.id);
      return res.json({ cart_item });
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
router.get('/cart/:id', async function (req, res, next) {
   try {
      //get order info
      const cart = await Cart.getByID(req.params.id); // should return { id, username, total, created_at }

      if (!cart) {
         return res.status(404).json({ error: 'Order not found' });
      }

      //get order items
      const items = await CartItem.getAllByCartID(req.params.id); // should return array of { product_id, name, quantity, price_at_purchase }

      //combine for our response
      const response = {
         cart: {
            ...cart,
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
//FIN:
router.patch('/:id', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, cartItemUpdateSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const cart_item = await CartItem.update(req.params.id, req.body);
      return res.json({ cart_item });
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
      await CartItem.remove(req.params.id);
      return res.json({ deleted: req.params.id });
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
router.delete('/cart/:cartID', async function (req, res, next) {
   try {
      await CartItem.clearCartItems(req.params.cartID);
      return res.json({ deleted: req.params.cartID });
   } catch (err) {
      return next(err);
   }
});

module.exports = router;
