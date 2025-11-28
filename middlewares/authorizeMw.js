import Order from "../models/orderSchema.js";

export const isAdmin = (req,res,next) => {
    if(req.user.role != 'Admin'){
        return res.status(401).json({message : 'You do not have appropriate permission to perform this action !!!'});
    }

    next();//Pass the control to the next function in the sequence
}


export const checkOrderOwnership = async (req,res,next) => {
    try{
        const userId = req.user.id;
        
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({message : 'Order not found'});

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not own this order' });
        }

        next();//Order Ownership confirmed,Proceed
        
        } catch(error){
        // Check for invalid ID format first (client error)
        if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid Order ID format: ${req.params.id}` });
        }
        // Handle other errors (server error)
            return res.status(500).json({message : 'Internal server error',error : error.message});
        }
}


export const isCustomer = (req,res,next) => {
    
    if(req.user.role == 'Admin' || req.user.role == 'Seller' || req.user.role == 'DeliveryBoy'){
        return res.status(403).json({message : 'You do not have permission to perform this action'});
    }

    next();
}