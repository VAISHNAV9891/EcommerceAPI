import Product from '../models/productSchema.js'


export const createProduct = async (req,res) => {
    

    try {
        if(!req.body.name || !req.body.brand || !req.body.price || !req.body.description || !req.body.category || !req.body.stock){
        return res.status(400).json({message : 'All fields are required'});
        }
        
         const newProduct = await Product.create(req.body);
         return res.status(201).json(newProduct);

    } catch(error) {
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format !',error : error.message});
        }
        return res.status(400).json({message : 'Something went wrong',error : error.message});

    }

 
}

export const getAllProducts = async (req,res) => {
    try {
        //Applying pagination concepts for smooth and efficient delivery of data without slowness,overload or browser crash
        const limit = parseInt(req.query.limit) || 10;
        const cursor = req.query.cursor;
        const filter = {};

        if(cursor){
            filter._id = {$gt : cursor};
        }

        const products = await Product.find(filter)
        .sort({_id : 1})
        .limit(limit);

        const nextCursor = (products.length == limit) ? products[products.length() - 1]._id : null;

       

        return res.status(200).json({
         products,
         nextCursor
        });
    } catch(error) {
        return res.status(500).json({message : 'Internal server error',error : error.message});
    }
}

export const getSingleProduct = async (req,res) => {
    try {
        const productId = req.params.id;
        const fetchedProduct = await Product.findById(productId);

        if(!fetchedProduct) return res.status(404).json({message : 'Product not found'});
        
        return res.status(200).json(fetchedProduct);
    } catch(error){
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Invalid product ID'});
        }
        return res.status(500).json({message : 'Internal server error',error : error.message});
    }
}

export const updateProduct = async (req,res) => {   
try {
    const productId = req.params.id;
    const updatedProduct = await Product.findByIdAndUpdate(productId,req.body,{new : true});
    if(!updatedProduct) return res.status(404).json({message : 'Product not found'});

    return res.status(200).json(updatedProduct);
} catch(error) {
    if(error.name === 'CastError'){
        return res.status(400).json({message : 'Id or data is given in the invalid format !',error : error.message});
    }

    return res.status(500).json({message : 'Internal server error',error : error.message});//Internal server error 
}

}

export const deleteProduct = async (req,res) => { 
     try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if(!deletedProduct) return res.status(404).json({message : 'Product not found'});
        
        return res.json({message : 'Product deleted successfully'});
     } catch(error){
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Invalid product ID'});
        }
        return res.status(500).json({message : 'Internal server error',error : error.message});
     }
}