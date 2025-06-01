'use strict';

//Default route
const express = require('express');
const router = new express.Router();

/** GET / => Basic API status and info
 *
 * No authentication required.
 */
router.get('/', function (req, res) {
   return res.json({
      message: 'Welcome to my API',
      status: 'OK',
      version: '1.0.0',
      endpoints: {
         auth: '/auth',
         users: '/users',
         products: '/products',
         categories: '/categories',
         carts: '/carts',
         cart_items: '/cart-items',
         orders: '/orders',
         order_items: '/order-items',
      },
   });
});

module.exports = router;
