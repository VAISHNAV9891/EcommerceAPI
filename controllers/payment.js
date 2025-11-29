import Stripe from 'stripe'
import Order from '../models/orderSchema.js'
import 'dotenv/config'//Load the environment variables , from the .env file 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req,res) => {
    try {
        const orderId = req.body.orderId;
        const userId = req.user.id;
        if(!orderId){
            return res.status(400).json({ message: 'Order ID is required' });
        }

        const order = await Order.findById(orderId);
        if(!order){
            return res.status(404).json({ message: 'Order not found' });
        }

        //Security check to ensure each user is paying for their order only
        if(order.user.toString() !== userId){
            return res.status(403).json({ message: 'Forbidden: You can only pay for your own orders.' });
        }

        const amountToCharge = order.totalPrice;

        //Create the payment intents with stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount : amountToCharge,
            currency : 'inr',
            metadata : {order_id : order._id.toString()}
        });


        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        }); 
    }catch(error){
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Order ID format' });
        }
        res.status(500).json({ message: 'Error creating payment intent', error: error.message });
    }
}

export const handleStripeWebhook = async (req, res) => {
    
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the specific event types
    try {
        switch (event.type) {
            
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata.order_id;

                console.log(`Payment succeeded for Order: ${orderId}`);

                await Order.findByIdAndUpdate(orderId, { 
                    paymentStatus: 'Successful', 
                    paymentId: paymentIntent.id 
                });
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata.order_id;
                const errorMessage = paymentIntent.last_payment_error?.message || "Payment Failed";

                console.error(`Payment failed for Order: ${orderId}. Reason: ${errorMessage}`);

                await Order.findByIdAndUpdate(orderId, { 
                    paymentStatus: 'Failed', 
                    paymentId: paymentIntent.id
                });
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (dbError) {
        console.error(`Database update failed:`, dbError);
        return res.status(500).json({ message: 'Internal Server Error during DB update' });
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
};
