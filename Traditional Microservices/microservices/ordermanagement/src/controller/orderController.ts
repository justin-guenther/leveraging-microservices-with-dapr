// default
import HttpStatusCode from '../entities/HttpStatusCode';

// middleware
import {Database} from '../middleware/database';

// services
import axios from 'axios';

const productCatalogServiceUrl = 'http://productcatalog:3500/api/v1';
const cartServiceUrl = 'http://shoppingcart:3501/api/v1';

const db = new Database();

const handleGetOrderDetails = async (req, res) => {
    try {
        const {uid} = req.body;

        const orders = await db.Query('SELECT * FROM order_management.orders WHERE user_id = ?', [uid]);

        res.status(HttpStatusCode.OK).json(orders);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Bestellungen konnten nicht abgerufen werden!'});
    }
};

const handleProcessOrder = async (req, res) => {
    try {
        const {uid} = req.body;

        // Fetch the current cart items from CartService
        const cartResponse = await axios.get(`${cartServiceUrl}/cart`, {
            data: {
                uid: uid
            }
        });
        const cartItems = cartResponse.data;

        const productsResponse = await axios.get(`${productCatalogServiceUrl}/products`);
        const products = productsResponse.data;

        // Get product details for each cart item
        for (const cartItem of cartItems) {
            const product = products.find(product => product.id === cartItem.product_id);
            cartItem.price = product.price;
        }

        // Check if the cart is empty
        if (!cartItems || cartItems.length === 0) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Warenkorb ist leer!'});
        }

        // Calculate total price
        let totalPrice = 0;
        for (const cartItem of cartItems) {
            totalPrice += cartItem.price * cartItem.quantity;
        }

        // Create a new order
        const newOrder = await db.Query('INSERT INTO order_management.orders (user_id, status, total_price) VALUES (?, ?, ?)', [uid, 0, totalPrice]);

        for (const cartItem of cartItems) {
            const existingOrderItem = await db.Query('SELECT * FROM order_management.order_items WHERE order_id = ? AND product_id = ?', [uid, cartItem.product_id]);

            if (existingOrderItem.length > 0) {
                // Update quantity if the item already exists in the order
                await db.Query('UPDATE order_management.order_items SET quantity = quantity + ? WHERE order_id = ? AND product_id = ?', [cartItem.quantity, uid, cartItem.product_id]);
            } else {
                // Insert new order item if it doesn't exist
                await db.Query('INSERT INTO order_management.order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [newOrder["insertId"], cartItem.product_id, cartItem.quantity, cartItem.price]);
            }

            // Remove the item from the cart
            await axios.delete(`${cartServiceUrl}/cart`, {
                data: {
                    uid: uid,
                    item_id: cartItem.cart_item_id
                }
            });
        }

        res.status(HttpStatusCode.CREATED).json({message: 'Bestellung wurde erfolgreich durchgeführt!'});
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Bestellung konnte nicht durchgeführt werden!'});
    }
};

const orderController = {
    handleGetOrderDetails,
    handleProcessOrder
}

export default orderController;