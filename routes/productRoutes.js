import express from 'express'
import {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.js'
import { tokenVerifier } from '../middlewares/verifyToken.js';
import { isAdmin } from '../middlewares/authorizeMw.js';

const productRouter  = express.Router();


productRouter.post('/',tokenVerifier,isAdmin,createProduct);
productRouter.get('/',getAllProducts);
productRouter.get('/:id',getSingleProduct);
productRouter.patch('/:id',tokenVerifier,isAdmin,updateProduct);
productRouter.delete('/:id',tokenVerifier,isAdmin,deleteProduct);

export default productRouter;