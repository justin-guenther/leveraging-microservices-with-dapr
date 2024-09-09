// default
import HttpStatusCode from '../entities/HttpStatusCode';

// middleware
import {Database} from '../middleware/database';

// services
import axios from 'axios';

const orderManagementServiceUrl = 'http://ordermanagement:3502/api/v1';

const db = new Database();

const handleGetStatusForApproval = async (req, res) => {
    try {
        const {order_id} = req.params;

        const orderStatus = await db.Query('SELECT status FROM order_approval.approvals WHERE order_id = ?', [order_id]);

        res.status(HttpStatusCode.OK).json(orderStatus);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Status der Bestellung konnten nicht abgerufen werden!'});
    }
};

const handleCreateNewApproval = async (req, res) => {
    try {
        const {uid, order_id} = req.body;

        const orderDetailsResponse = await axios.get(`${orderManagementServiceUrl}/order`, {
            data: {
                uid: uid
            }
        });
        const order = orderDetailsResponse.data;

        if (!order || order.length === 0) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Diese Bestellung existiert nicht!'});
        }

        let orderExists = false;
        for (const orderItem of order) {
            if (orderItem.order_id !== order_id) {
                continue;
            }

            if (orderItem.status !== 0) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Diese Bestellung wurde bereits zur Genehmigung freigeschaltet!'});
            }

            orderExists = true;
        }

        if (!orderExists) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Diese Bestellung existiert nicht!'});
        }

        // Create a new approval
        const newApproval = await db.Query('INSERT INTO order_approval.approvals (order_id, status) VALUES (?, ?)', [order_id, 1]);

        if (newApproval["insertId"] === 0) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Bestellung konnte nicht zur Genehmigung freigeschaltet werden!'});
        }

        res.status(HttpStatusCode.CREATED).json({message: 'Bestellung wurde zur Genehmigung freigeschaltet!'});
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Bestellung konnte nicht durchgeführt werden!'});
    }
};

const handleApproveOrder = async (req, res) => {
    try {
        const {order_id} = req.params;

        const approval = await db.Query('UPDATE order_approval.approvals SET status = 3 WHERE order_id = ?', [order_id]);

        if (approval["affectedRows"] === 0) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Bestellung konnte nicht genehmigt werden! Die Bestellung wurde noch nicht zur Genehmigung freigeschaltet!'});
        }

        res.status(HttpStatusCode.OK).json({message: 'Bestellung wurde genehmigt!'});
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Bestellung konnte nicht genehmigt werden!'});
    }
}

const handleRejectOrder = async (req, res) => {
    try {
        const {order_id} = req.params;

        const approval = await db.Query('UPDATE order_approval.approvals SET status = 2 WHERE order_id = ?', [order_id]);

        if (approval["affectedRows"] === 0) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Bestellung konnte nicht abgelehnt werden! Die Bestellung wurde noch nicht zur Genehmigung freigeschaltet!'});
        }

        res.status(HttpStatusCode.OK).json({message: 'Bestellung wurde abgelehnt!'});
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Bestellung konnte nicht abgelehnt werden!'});
    }
}

const approvalsController = {
    handleGetStatusForApproval,
    handleCreateNewApproval,
    handleApproveOrder,
    handleRejectOrder
}

export default approvalsController;