import express from 'express'
import {
addToCart,
getCart,
getAllCarts,
getSingleCart,
updateCart,
deleteItemFromCart,
emptyTheWholeCart
} from '../controllers/cart.js'

import {tokenVerifier} from '../middlewares/verifyToken.js'
import { isAdmin } from '../middlewares/authorizeMw.js';
import { isCustomer } from '../middlewares/authorizeMw.js';

const cartRouter = express.Router();

//We don't allow admins and other roles to touch these endpoints, if we do then it is considered as a "Dark pattern" 

//User specific routes
cartRouter.post('/myCart', tokenVerifier, isCustomer, addToCart);//user only
cartRouter.get('/myCart', tokenVerifier, isCustomer, getCart);//user only
cartRouter.patch('/myCart/item', tokenVerifier, isCustomer, updateCart);//user only
cartRouter.delete('/myCart/item/:itemId', tokenVerifier, isCustomer, deleteItemFromCart);//user only
cartRouter.delete('/myCart', tokenVerifier, isCustomer, emptyTheWholeCart);//user only



//Admin specific routes -> only admins can access this 
cartRouter.get('/admin/all', tokenVerifier, isAdmin, getAllCarts);//admin only
cartRouter.get('/admin/:cartId', tokenVerifier, isAdmin, getSingleCart);//admin only







export default cartRouter;