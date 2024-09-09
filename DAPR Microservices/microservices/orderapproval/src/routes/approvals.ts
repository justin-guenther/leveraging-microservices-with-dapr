// express
import express from 'express';

// controller
import approvalsController from '../controller/approvalsController';

const router = express.Router();

router.get('/:order_id', approvalsController.handleGetStatusForApproval);
router.post('/', approvalsController.handleCreateNewApproval);
router.put('/:order_id/approve', approvalsController.handleApproveOrder);
router.put('/:order_id/reject', approvalsController.handleRejectOrder);

module.exports = router;