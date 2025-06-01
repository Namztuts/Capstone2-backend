'use strict';

const express = require('express');
const cors = require('cors');

const { NotFoundError } = require('./expressError');

// const { authenticateJWT } = require('./middleware/auth');
const defaultRoute = require('./routes/default');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartsRoutes = require('./routes/carts');
const cartItemsRoutes = require('./routes/cartItems');
const ordersRoutes = require('./routes/orders');
const orderItemsRoutes = require('./routes/orderItems');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', defaultRoute);
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/carts', cartsRoutes);
app.use('/cart-items', cartItemsRoutes);
app.use('/orders', ordersRoutes);
app.use('/order-items', orderItemsRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
   console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`); //NOTE: here so we can check what is causing Render deployment issues
   return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
   if (process.env.NODE_ENV !== 'test') console.error(err.stack);
   const status = err.status || 500;
   const message = err.message;

   return res.status(status).json({
      error: { message, status },
   });
});

module.exports = app;
