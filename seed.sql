-- const { sequelize } = require('./models');

-- sequelize.sync({ force: true }) // force: true drops and recreates tables
--   .then(() => console.log("Database synced"))
--   .catch(err => console.error("Sync failed", err));


INSERT INTO users (username, first_name, last_name, email, password)
VALUES 
('asmith','Alice', 'Smith', 'alice@example.com', 'hashed_password_1'),
('bjohnson','Bob', 'Johnson', 'bob@example.com', 'hashed_password_2');

INSERT INTO categories (name)
VALUES 
('Books'),
('Electronics'),
('Clothing'),
('Home & Kitchen');

INSERT INTO products (name, description, price, image_url, stock, category_id)
VALUES 
('Wireless Mouse', 'A comfortable wireless mouse', 25.99, 'https://example.com/mouse.jpg', 50, 2),
('Bluetooth Speaker', 'Portable speaker with great sound', 49.99, 'https://example.com/speaker.jpg', 30, 2),
('T-shirt', '100% Cotton T-shirt', 15.00, 'https://example.com/tshirt.jpg', 100, 3),
('Cookware Set', '10-piece nonstick cookware set', 89.99, 'https://example.com/cookware.jpg', 20, 4),
('Fiction Book', 'A best-selling novel', 12.50, 'https://example.com/book.jpg', 75, 1);

INSERT INTO carts (username)
VALUES
('asmith'),
('bjohnson');

INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES
(1, 1, 2), -- Alice has 2 wireless mice
(2, 3, 1); -- Bob has 1 T-shirt

INSERT INTO orders (username, total)
VALUES
('asmith',  51.98), -- 2 x 25.99
('bjohnson',  15.00); -- 1 x 15.00

INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
VALUES
(1, 1, 2, 25.99), -- Alice bought 2 wireless mice at $25.99
(2, 3, 1, 15.00); -- Bob bought 1 T-shirt at $15.00
