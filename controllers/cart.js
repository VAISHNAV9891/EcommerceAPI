import User from '../models/userSchema.js'
import Product from '../models/productSchema.js'
import Cart from '../models/cartSchema.js'


//User only
export const addToCart = async (req,res) => {

    try {
    
          const {product} = req.body;
          const userId = req.user.id;

           if (!product) {
           return res.status(400).json({ message: 'Product ID is required' });
           }

           //Validating the product Id here 
           const item = await Product.findOne({_id : product});
           if(!item){
            return res.status(400).json({message : 'Please give a valid product id'});
           }

            const cart = await Cart.findOne({user : req.user.id});

            if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user' });
            }

            // Check if the product is already in the cart
            const itemIndex = cart.items.findIndex(item => item.product._id.toString() === product);

           if (itemIndex > -1) {//If the product is already in the cart -> perform this action
                return res.status(400).json({ 
                    message: 'Item is already in the cart. Please use the update quantity endpoint.' 
                });
            }

            
            cart.items.push({ product: product, quantity: 1 });
            await cart.save()

            await cart.populate([
            { path: 'user'},
            { path: 'items.product'}
            ]);
           
            return res.status(200).json({message : 'Item is successfully added to the cart',cart});

    }catch(error){
        if (error.name === 'CastError') {
        return res.status(400).json({message: 'Data is provided in the invalid format.'});
       }

        return res.status(500).json({message : 'Internal Server Error',error : error.message});
    }
    
}

export const getCart = async (req,res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({user : userId})
        .populate('user')
        .populate('items.product');

        if(!cart) return res.status(404).json({message : 'Cart not found for this user'});

        return res.status(200).json(cart);

    } catch(error){
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format.'});
        }
        return res.status(500).json({message : 'Internal server error'});
    }
}

export const updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

       
        if (quantity < 1) {
            return res.status(400).json({ message: 'Please provide a valid quantity value' });
        }

        
        const item = await Product.findById(productId);
        if (!item) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

      
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        
        const idx = cart.items.findIndex(item => item.product.toString() === productId);

        if (idx === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        
        cart.items[idx].quantity = quantity;

        
        await cart.save();

        await cart.populate([
            { path: 'user', select: 'username email' },
            { path: 'items.product', select: 'name price' }
        ]);
       

        return res.status(200).json(cart);

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export const deleteItemFromCart = async (req,res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.itemId;

        const cart = await Cart.findOne({user : userId});

        if (!cart) return res.status(404).json({message: 'Cart not found'});


        const idx = cart.items.findIndex(item => item.product.toString() == itemId);

        if(idx == -1){
            return res.status(400).json({message : 'Please provide a valid item id'});
        }

        cart.items.splice(idx,1);

        await cart.save();

        await cart.populate([
            {path : 'user'},
            {path : 'items.product'}
        ]);

        return res.status(200).json({message : 'Cart is updated successfully', cart});
    } catch(error){ 
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format.'});
        }
        return res.status(500).json({message : 'Internal server error'});
    
     }

}

export const emptyTheWholeCart = async (req, res) => {
    try {
        // Find the cart AND set items to empty [] in one go
        const cart = await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $set: { items: [] } }, // MongoDB operator to set field
            { new: true } // Return the empty cart
        );

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        return res.status(200).json({ message: 'Cart emptied successfully', cart});
    } catch (error) {
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format.'});
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}



//Admin only 
export const getAllCarts = async (req,res) => {
    try {
        const carts = await Cart.find({})
        .populate('user')
        .populate('items.product');

        if (carts.length === 0) {
            return res.status(404).json({ message: 'No active carts found' });
        }

        return res.status(200).json(carts);
    } catch(error){
        if(error.name == 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format'});
        }
        return res.status(500).json({message : 'Internal server error'});
    }
}

export const getSingleCart = async (req,res) => {
    try {
        const cartId = req.params.cartId;

        const cart = await Cart.findById(cartId)
        .populate('user')
        .populate('items.product');

        if(!cart){
            return res.status(404).json({message : 'Cart not found'});
        }

        return res.status(200).json(cart);
    } catch(error){
        if(error.name == 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format'});
        }
        return res.status(500).json({message : 'Internal server error'});
    }
}






