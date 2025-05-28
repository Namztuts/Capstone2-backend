'use strict';

/** Routes for cart items. */

const jsonschema = require('jsonschema');

const express = require('express');
// const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require('../expressError');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const orderItemNewSchema = require('../schemas/orderItemNew.json');
const orderItemUpdateSchema = require('../schemas/orderItemUpdate.json');

const router = express.Router();

/** POST / { cart }  => { cart }
 *
 * Adds a new cart item and returns the cart item data
 *
 *  {cart: { id, username } }
 *
 * Authorization required: admin
 **/

// router.post('/', ensureAdmin, async function (req, res, next) {
//FIN:
router.post('/', async function (req, res, next) {
   try {
      const validator = jsonschema.validate(req.body, orderItemNewSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const order_item = await OrderItem.add(req.body);
      return res.status(201).json({ order_item });
   } catch (err) {
      return next(err);
   }
});

/** POST / { cart }  => { cart }
 *
 * For adding bulk order-items
 *
 *  {cart: { id, username } }
 *
 * Authorization required: admin
 **/

// router.post('/', ensureAdmin, async function (req, res, next) {
//FIN:
router.post('/bulk', async function (req, res, next) {
   console.log('reaching bulk route');
   try {
      if (!Array.isArray(req.body)) {
         throw new BadRequestError('Expected an array of order items');
      }
      for (let item of req.body) {
         const validator = jsonschema.validate(item, orderItemNewSchema);
         if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
         }
      }
      console.log('route request', req.body);
      const addedItems = await OrderItem.addBulk(req.body);
      console.log('route addedItems', addedItems);
      return res.status(201).json({ addedItems });
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
      const order_items = await OrderItem.findAll();
      return res.json({ order_items });
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
      const order_item = await OrderItem.get(req.params.id);
      return res.json({ order_item });
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
router.get('/order/:id', async function (req, res, next) {
   try {
      //get order info
      const order = await Order.get(req.params.id); // should return { id, username, total, created_at }

      if (!order) {
         return res.status(404).json({ error: 'Order not found' });
      }

      //get order items
      const items = await OrderItem.getAllByOrderID(req.params.id); // should return array of { product_id, name, quantity, price_at_purchase }

      //combine for our response
      const response = {
         order: {
            ...order,
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
      const validator = jsonschema.validate(req.body, orderItemUpdateSchema);
      if (!validator.valid) {
         const errs = validator.errors.map((e) => e.stack);
         throw new BadRequestError(errs);
      }

      const order_item = await OrderItem.update(req.params.id, req.body);
      return res.json({ order_item });
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
      await OrderItem.remove(req.params.id);
      return res.json({ deleted: req.params.id });
   } catch (err) {
      return next(err);
   }
});

module.exports = router;
