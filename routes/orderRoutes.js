import express from 'express'
import {
    placeOrder,
    getAllOrders,
    getSingleOrder,
    updateOrderStatus,
    cancelOrder
} from '../controllers/order.js'

const orderRouter  = express.Router();


orderRouter.post('/',placeOrder);
orderRouter.get('/',getAllOrders);
orderRouter.get('/:id',getSingleOrder);
orderRouter.patch('/:id',updateOrderStatus);
orderRouter.delete('/:id',cancelOrder);

export default orderRouter;