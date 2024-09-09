// express
import express from 'express';

// controller
import orderController from '../controller/orderController';

const router = express.Router();

router.get('/', orderController.handleGetOrderDetails);
router.post('/', orderController.handleProcessOrder);

module.exports = router;