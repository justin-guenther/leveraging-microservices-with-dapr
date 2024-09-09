// default
import HttpStatusCode from '../entities/HttpStatusCode';

// middleware
import {Database} from '../middleware/database';

// services
import axios from 'axios';

const productCatalogServiceUrl = 'http://productcatalog:3500/api/v1';

const db = new Database();

const handleGetCart = async (req, res) => {
    try {
        const {uid} = req.body;

        const products = await db.Query('SELECT * FROM shopping_cart.cart_items WHERE user_id = ?', [uid]);

        res.status(HttpStatusCode.OK).json(products);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Produktkatalog konnte nicht abgerufen werden!'});
    }
}

const handleAddCartItem = async (req, res) => {
    try {
        const {uid, product_id, quantity} = req.body;

        const productsResponse = await axios.get(`${productCatalogServiceUrl}/products`);
        const products = productsResponse.data;

        const existingProduct = products.find(product => product.id === product_id);

        if (!existingProduct) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Produkt existiert nicht!'});
        }

        const existingItem = await db.Query('SELECT * FROM shopping_cart.cart_items WHERE user_id = ? AND product_id = ?', [uid, product_id]);

        if (existingItem.length > 0) {
            await db.Query('UPDATE shopping_cart.cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', [quantity, uid, product_id]);
        } else {
            await db.Query('INSERT INTO shopping_cart.cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [uid, product_id, quantity]);
        }

        const updatedCartItems = await db.Query('SELECT * FROM shopping_cart.cart_items WHERE user_id = ?', [uid]);

        res.status(HttpStatusCode.CREATED).json(updatedCartItems);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Produkt konnte nicht hinzugefügt werden!'});
    }
}

const handleDeleteCartItem = async (req, res) => {
    try {
        const {uid, item_id} = req.body;

        const result = await db.Query('DELETE FROM shopping_cart.cart_items WHERE cart_item_id = ? AND user_id = ?', [item_id, uid]);

        if (result["affectedRows"] === 0) {
            return res.status(HttpStatusCode.OK).json({message: 'Produkt konnte im Warenkorb nicht gefunden werden!'});
        }

        res.status(HttpStatusCode.OK).json({message: 'Produkt wurde aus dem Warenkorb entfernt!'});
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Produkt konnte nicht aus dem Warenkorb entfernt werden!'});
    }
};

const cartController = {
    handleGetCart,
    handleAddCartItem,
    handleDeleteCartItem
}

export default cartController;