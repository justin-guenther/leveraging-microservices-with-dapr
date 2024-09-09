// default
import HttpStatusCode from '../entities/HttpStatusCode';

// middleware
import {Database} from '../middleware/database';

// services
import axios from 'axios';
//import {DaprClient} from "@dapr/dapr";

const db = new Database();

// configuration
const daprHost = "http://localhost";
const daprPort = "3500";

// Initialize Dapr client
//const client = new DaprClient({ daprHost, daprPort });

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
        const {uid, cart} = req.body.data;

        const productsResponse = await axios.get(`${daprHost}:${daprPort}/products`, {
            headers: {
                "dapr-app-id": "productcatalog"
            }
        });
        const products = productsResponse.data;

        // Get product details for each cart item
        for (const cartItem of cart) {
            const product = products.find(product => product.id === cartItem.product_id);
            cartItem.price = product.price;
        }

        // Calculate total price
        let totalPrice = 0;
        for (const cartItem of cart) {
            totalPrice += cartItem.price * cartItem.quantity;
        }

        // Create a new order
        const newOrder = await db.Query('INSERT INTO order_management.orders (user_id, status, total_price) VALUES (?, ?, ?)', [uid, 0, totalPrice]);

        for (const cartItem of cart) {
            await db.Query('INSERT INTO order_management.order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [newOrder["insertId"], cartItem.product_id, cartItem.quantity, cartItem.price]);
        }

        const config = {
            headers: {
                "dapr-app-id": "orderapproval"
            }
        };

        const data = {
            uid: uid,
            order_id: newOrder["insertId"]
        };

        await axios.post(`${daprHost}:${daprPort}/approvals`, data, config);

        res.status(HttpStatusCode.CREATED).json({message: 'Bestellung wurde erfolgreich durchgeführt!'});
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Bestellung konnte nicht durchgeführt werden!'});
    }
};

const orderController = {
    handleGetOrderDetails,
    handleProcessOrder
}

export default orderController;