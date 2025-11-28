import express from 'express'
import { tokenVerifier } from '../middlewares/verifyToken.js'; 

//Import the rating/review controllers here
import {
createReview,
getAllReviews,
updateReview,
deleteReview,
getSingleReview
} from '../controllers/review.js'
import { isCustomer } from '../middlewares/authorizeMw.js';


const reviewRouter = express.Router();

reviewRouter.post('/',tokenVerifier, isCustomer, createReview);
reviewRouter.get('/allReviews/:id',getAllReviews);
reviewRouter.get('/review/:id',getSingleReview);
reviewRouter.patch('/:id',tokenVerifier, isCustomer, updateReview);
reviewRouter.delete('/:id',tokenVerifier,deleteReview);




export default reviewRouter;
