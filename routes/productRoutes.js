import express from 'express'
import {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.js'

const productRouter  = express.Router();


productRouter.post('/',createProduct);
productRouter.get('/',getAllProducts);
productRouter.get('/:id',getSingleProduct);
productRouter.patch('/:id',updateProduct);
productRouter.delete('/:id',deleteProduct);

export default productRouter;