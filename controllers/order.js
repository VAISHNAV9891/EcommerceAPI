import Order from '../models/orderSchema.js';
import User from '../models/userSchema.js';
import Product from '../models/productSchema.js';
import Cart from '../models/cartSchema.js'; 

const findOrderByIdService = async (orderId) => {//Helper function to get the order by it's id
    const order = await Order.findById(orderId);
    return order;    
}


export const placeOrder = async (req, res) => {
    try {
        
        const { shippingAddress } = req.body;
        const userId = req.user.id;

        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required.' });
        }

        
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty. Add items first.' });
        }

        
        let toPay = 0;
        const orderItems = [];

        for (const item of cart.items) {
            
            if (!item.product) {
                continue; 
            }

            
            orderItems.push({
                product: item.product._id, 
                quantity: item.quantity
            });

            
            toPay += item.product.price * item.quantity;
        }

        
        const newOrder = await Order.create({
            user: userId,
            items: orderItems,
            totalPrice: toPay,
            shippingAddress: shippingAddress
        });

        
        await User.findByIdAndUpdate(userId, { 
            $push: { orders: newOrder._id } 
        });

        
        cart.items = [];
        await cart.save();

        await newOrder.populate([
            {path : 'user'},
            {path : 'items.product'}
        ]);

       
        return res.status(201).json({
            message: 'Order placed successfully!',
            order: newOrder
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid data format.', 
                error: error.message 
            });
        }
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

export const getAllOrders = async (req,res) => {
   try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;
    
    const filter = {};

    if(req.user.role === 'Customer'){
    //If it's the Customer , change the filter to only find their orders
        filter.user = req.user.id; 
    }

    if(cursor){
        filter._id = {$gt : cursor};
    }
    
    
     

    //If it's the Admin then it will automatically find all the orders for admin, because the filter remains empty (finds all)
    const orders = await Order.find(filter)
    .sort({_id : 1})//sorts the list in the ascending order
    .limit(limit)
    .populate('user')
    .populate('items.product')

    const nextCursor  = (orders.length == limit)? orders[orders.length() - 1]._id : null;

    res.status(200).json({
        message : 'Orders fetched successfully',
        orders,
        nextCursor
    });

   }catch(error){
    return res.status(500).json({message : 'Internal server error',error : error.message});
   }
}

export const getSingleOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const loggedInUserId = req.user.id;
        const loggedInUserRole = req.user.role; // Assuming role is in the token

        
        const order = await Order.findById(orderId)
        .populate('user')
        .populate('items.product')

       
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

       
        // Allow if the user is an admin OR if the user owns this order
        if (loggedInUserRole === 'Admin' || order.user._id.toString() === loggedInUserId) {
            // User is authorized
            return res.status(200).json({message : 'Order fetched successfully',order});
        } else {
            // User is not authorized for THIS specific order
            return res.status(403).json({ message: 'Forbidden: You do not have permission to view this order.' });
        }

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Invalid ID format'});
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const updateOrderStatus = async (req,res) => {
    try {
        const orderId = req.params.id;
        const updateOrder = await findOrderByIdService(orderId);

        if(updateOrder.status === 'Cancelled'){
            return res.status(400).json({message : 'Order is already cancelled !!!!'});
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId,{status : req.body.status},{new : true})
        .populate('user')
        .populate('items.product');


        if(!updatedOrder) return res.status(404).json({message : 'Order not found'});

        return res.status(200).json(updatedOrder);//Return the updated order with updated order status

    } catch(error) {
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'ID or data is provided in the invalid format !'});
        }

        return res.status(404).json({message : 'There is some error while updating the order',error : error.message});
    }
}

export const cancelOrder = async (req,res) => {//We can let users cancel the order with the given ID until shipping 
try {
    
    const orderId = req.params.id;
    const order = await findOrderByIdService(orderId);
    if(!order) return res.status(404).json({message : 'Order not found'});

    const nonCancellableStatuses = ['Cancelled', 'Delivered', 'Out for Delivery', 'Shipped'];

    if (nonCancellableStatuses.includes(order.status)) {
    return res.status(400).json({ message: `Order cannot be cancelled as its status is '${order.status}'` });
    }

    //Else we know it is gurranteed that the order status is pending -> and we can cancel the pending order !
    order.status = 'Cancelled';
     await order.save();


    //Facilitating frontend
    order.populate([
        {path : 'user'},
        {path : 'items.product'}
    ])

    return res.status(200).json({message : "Order cancelled successfully.",order});
} catch(error) {
    if(error.name === 'CastError'){
        return res.status(400).json({message : 'Invalid order ID'});
    }
    return res.status(404).json({message : 'An internal server error occurred. Please try again later !',error : error.message});
}



}