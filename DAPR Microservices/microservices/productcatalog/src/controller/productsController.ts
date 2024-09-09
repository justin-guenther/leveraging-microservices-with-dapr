// default
import HttpStatusCode from '../entities/HttpStatusCode';

// middleware
import {Database} from '../middleware/database';

const db = new Database();

const handleGetProducts = async (_req, res) => {
    try {
        const dbProducts = await db.Query('SELECT * FROM product_catalog.products');

        res.status(HttpStatusCode.OK).json(dbProducts);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Produktkatalog konnte nicht abgerufen werden!' });
    }
};

const handleGetProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const dbProduct = await db.Query('SELECT * FROM product_catalog.products WHERE id = ?', [id]);

        res.status(HttpStatusCode.OK).json(dbProduct);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Produkt konnte nicht abgerufen werden' });
    }
};

const productsController = {
    handleGetProducts,
    handleGetProductById
}

export default productsController;
