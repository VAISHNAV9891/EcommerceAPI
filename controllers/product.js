import Product from '../models/productSchema.js'


export const createProduct = async (req,res) => {
    if(!req.body.name || !req.body.Brand || !req.body.price || !req.body.description || !req.body.category || !req.body.stock){
        return res.status(400).json({message : 'All fields are required'});
    }

    try {

         const newProduct = await Product.create(req.body);
         return res.status(201).json(newProduct);

    } catch(error) {
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format !',error : error.message});
        }
        return res.status(400).json({message : 'Something went wrong',error : error.message});

    }

 
};

export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({});
        return res.status(200).json(products);
    } catch(error) {
        return res.status(404).json({message : 'There is some error while fetching the products',error : error.message});
    }
}

export const getSingleProduct = async (req,res) => {
    const productId = req.params.id;
    try {
        const fetchedProduct = await Product.findById(productId);

        if(!fetchedProduct) return res.status(404).json({message : 'Product not found'});
        
        return res.status(200).json(fetchedProduct);
    } catch(error){
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Invalid product ID'});
        }
        return res.status(404).json({message : 'There is some error while fetching the product',error : error.message});
    }
}

export const updateProduct = async (req,res) => {   
     const productId = req.params.id;

try {
    const updatedProduct = await Product.findByIdAndUpdate(productId,req.body,{new : true});
    if(!updatedProduct) return res.status(404).json({message : 'Product not found'});

    return res.status(200).json(updatedProduct);
} catch(error) {
    if(error.name === 'CastError'){
        return res.status(400).json({message : 'Id or data is given in the invalid format !',error : error.message});
    }

    return res.status(500).json({message : 'There is some error while updating the product',error : error.message});//Internal server error 
}

}

export const deleteProduct = async (req,res) => {
    const productId = req.params.id;
     try {
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if(!deletedProduct) return res.status(404).json({message : 'Product not found'});
        
        return res.json({message : 'Product deleted successfully'});
     } catch(error){
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Invalid product ID'});
        }
        return res.status(404).json({message : 'There is some error while deleting the product',error : error.message});
     }
}