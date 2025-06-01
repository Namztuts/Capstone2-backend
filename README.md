# Anything & Everything Backend API

This is the backend API for **Anything & Everything**, a full-stack e-commerce application. It handles all data processing including user authentication, product info, and cart/order management.

---

## About

This RESTful API powers the frontend by managing:

-  Users and authentication
-  Product and category listings
-  Cart and cart items
-  Orders and order items

---

## API Endpoints

### Authentication

-  `POST /auth/token`
-  `POST /auth/register`

### Users

-  `GET /users`
-  `GET /users/:username`
-  `PATCH /users/:username`
-  `DELETE /users/:username`

### Products

-  `POST /products`
-  `GET /products`
-  `GET /products/:id`
-  `PATCH /products/:id`
-  `DELETE /products/:id`

### Categories

-  `POST /categories`
-  `GET /categories`
-  `GET /categories/:id/products`
-  `PATCH /categories/:id`
-  `DELETE /categories/:id`

### Cart

-  `POST /carts`
-  `GET /carts`
-  `GET /carts/:username`
-  `PATCH /carts/:username`
-  `DELETE /carts/:username`
-  `DELETE /carts/:cartID/items`

### Cart-Items

-  `POST /cart-items`
-  `GET /cart-items`
-  `GET /cart-items/:id`
-  `GET /cart-items/cart/:id`
-  `PATCH /cart-items/:id`
-  `DELETE /cart-items/:id`
-  `DELETE /cart-items/cart/:cartID`

### Orders

-  `POST /orders`
-  `GET /orders`
-  `GET /orders/:id`
-  `GET /orders/:username/:id`
-  `PATCH /orders/:id`
-  `DELETE /orders/:id`

### Order Items

-  `POST /order-items`
-  `POST /order-items/bulk`
-  `GET /order-items`
-  `GET /order-items/:id`
-  `GET /order-items/order/:id`
-  `PATCH /order-items/:id`
-  `DELETE /order-items/:id`

---

## Tech Stack

-  Node.js
-  Express.js
-  PostgreSQL
-  JWT for authentication
-  bcrypt for password hashing
-  jsonschema for input validation
-  Jest and Supertest for testing

---

## Running Tests

```bash
cd my-api
npm install
jest
```

---

## 🛠️ Setup Instructions

1. Clone the repo:

   ```bash
   git clone https://github.com/Namztuts/Capstone2-backend
   cd my-api
   ```

2. Create a PostgreSQL database:

   ```
   psql a_and_e
   ```

3. Run schema and seed data:

   ```bash
   psql a_and_e
   \i schema.sql
   \i seed.sql
   ```

4. Start the dev server:
   ```bash
   nodemon server.js
   ```

---

## 📌 Notes

-  JWT token must be sent in the `Authorization` header for protected routes
-  Follows REST principles with clear endpoint structure
-  Secure password handling with bcrypt
-  Custom error classes and middleware for error handling

---

## Related

-  Frontend repo: [Anything & Everything React App](https://github.com/Namztuts/Capstone2-frontend)

---
