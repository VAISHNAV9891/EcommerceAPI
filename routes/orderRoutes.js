import express from 'express'
import {
    placeOrder,
    getAllOrders,
    getSingleOrder,
    updateOrderStatus,
    cancelOrder
} from '../controllers/order.js'
import { tokenVerifier } from '../middlewares/verifyToken.js'
import { isAdmin } from '../middlewares/authorizeMw.js'
import { checkOrderOwnership } from '../middlewares/authorizeMw.js'




const orderRouter  = express.Router();


orderRouter.post('/',tokenVerifier,placeOrder);
orderRouter.get('/',tokenVerifier,getAllOrders);//Only done by the admin
orderRouter.get('/:id',tokenVerifier,getSingleOrder);
orderRouter.patch('/:id',tokenVerifier,isAdmin,updateOrderStatus);//Update order status -> Admin only
orderRouter.patch('/:id/cancelOrderByAdmin',tokenVerifier,isAdmin,cancelOrder);//Cancel order -> Admin only using RBAC(Role-Based access control)
orderRouter.patch('/:id/cancelOrderByUser',tokenVerifier,checkOrderOwnership,cancelOrder);//Cancel order -> By User



export default orderRouter;