-- Microservice: Product Catalog
-- Table: Products

CREATE DATABASE IF NOT EXISTS product_catalog;
USE product_catalog;

CREATE TABLE IF NOT EXISTS products (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id)
);

-- Microservice: Shopping Cart
-- Table: CartItems

CREATE DATABASE IF NOT EXISTS shopping_cart;
USE shopping_cart;

CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_item_id)
);

-- Microservice: Order Management
-- Table: Orders

CREATE DATABASE IF NOT EXISTS order_management;
USE order_management;

CREATE TABLE IF NOT EXISTS orders (
    order_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id)
);

-- Table: OrderItems

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_item_id),
    FOREIGN KEY (order_id) REFERENCES orders (order_id)
);

-- Microservice: Order Approval
-- Table: Approvals

CREATE DATABASE IF NOT EXISTS order_approval;
USE order_approval;

CREATE TABLE IF NOT EXISTS approvals (
    approval_id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    approved_at TIMESTAMP DEFAULT NULL,
    rejected_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (approval_id),
    FOREIGN KEY (order_id) REFERENCES order_management.orders (order_id)
);

-- Microservice: Return Management
-- Table: Returns

CREATE DATABASE IF NOT EXISTS return_management;
USE return_management;

CREATE TABLE IF NOT EXISTS returns (
    return_id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (return_id),
    FOREIGN KEY (order_id) REFERENCES order_management.orders (order_id)
);
