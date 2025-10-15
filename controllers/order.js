import Order from '../models/orderSchema.js';

const findOrderByIdService = async (orderId) => {//Helper function to get the order by it's id
    const order = await Order.findById(orderId);
    return order;    
}

export const placeOrder = async (req,res) => {
    if(req.body.items.length == 0 || !req.body.shippingAddress || !req.body.totalPrice){
        return res.status(400).json({message : 'Order items, total price and shipping address are required to place an order !!!'});
    }


    try {
        const newOrder = await Order.create({
            items : req.body.items,
            totalPrice : req.body.totalPrice,
            shippingAddress : req.body.shippingAddress
        })

        if(!newOrder) return res.status(400).json({message : 'There is some error placing the order'});

        return res.status(201).json(newOrder);//Order placed successfully
    } catch(error){
        if (error.name === 'CastError') {
        return res.status(400).json({ 
            message: 'Data is provided in the invalid format .', 
            // Sending back Mongoose's specific message is very helpful for debugging
            error: error.message 
        });
       }
        return res.status(400).json({message : 'Something went wrong',error : error.message});
    }
}

export const getAllOrders = async (req,res) => {
try {
    const allOrders = await Order.find({});
    if(!allOrders) return res.status(404).json({message : 'No orders found'});
    return res.status(200).json(allOrders);

} catch(error){

    return res.status(404).json({message : 'There is some error while fetching the orders',error : error.message});
}
}

export const getSingleOrder = async (req,res) => {
    const orderId = req.params.id;
    try {
        const fetchedOrder = await findOrderByIdService(orderId);

        if(!fetchedOrder) return res.status(404).json({message : 'Order not found'});
        
        return res.status(200).json(fetchedOrder);//Return the fetched order 
    } catch(error){
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Invalid order ID'});
        }
        return res.status(404).json({message : 'There is some error while fetching the order',error : error.message});
    }
}

export const updateOrderStatus = async (req,res) => {
    const orderId = req.params.id;
    try {
        const updateOrder = await findOrderByIdService(orderId);
        if(updateOrder.status === 'Cancelled'){
            return res.status(400).json({message : 'Order is already cancelled !!!!'});
        }
        const updatedOrder = await Order.findByIdAndUpdate(orderId,{status : req.body.status},{new : true});
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
const orderId = req.params.id;


try {
    const order = await findOrderByIdService(orderId);
    if(!order) return res.status(404).json({message : 'Order not found'});

    const nonCancellableStatuses = ['Cancelled', 'Delivered', 'Out for Delivery', 'Shipped'];
    if (nonCancellableStatuses.includes(order.status)) {
    return res.status(400).json({ message: `Order cannot be cancelled as its status is '${order.status}'` });
    }

    //Else we know it is gurranteed that the order status is pending -> and we can cancel the pending order !
    order.status = 'Cancelled';
    const cancelledOrder = await order.save();

    return res.status(200).json(cancelledOrder);
} catch(error) {
    if(error.name === 'CastError'){
        return res.status(400).json({message : 'Invalid order ID'});
    }
    return res.status(404).json({message : 'An internal server error occurred. Please try again later !',error : error.message});
}



}