// express
import express from 'express';

// controller
import productsController from '../controller/productsController';

const router = express.Router();

router.get('/', productsController.handleGetProducts);
router.get('/:id', productsController.handleGetProductById);

module.exports = router;