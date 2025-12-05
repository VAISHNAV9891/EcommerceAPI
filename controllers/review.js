import User from '../models/userSchema.js';
import Review from '../models/reviewSchema.js';
import Product from '../models/productSchema.js';



export const createReview = async (req,res) => {
try{
const {rating,comment,productId} = req.body;

if(!rating || !productId){//Can't post a review
return res.status(400).json({message : 'Rating and Product ID are required'});
}

const product = await Product.findById(productId);
if (!product) {
  return res.status(404).json({ message: 'Product not found.' });
}


if(req.user.role == 'Admin' || req.user.role == 'Seller' || req.user.role == 'DeliveryBoy'){
    return res.status(403).json({message : 'You are not allowed to perform this action'});
}


const existingReview = await Review.findOne({ userId : req.user.id, productId : productId });
if (existingReview) {
  return res.status(400).json({ message: 'You have already reviewed this product.' });
}



const newReview = await Review.create({
    rating : rating,
    comment: comment?.trim() || '',
    userId : req.user.id,
    productId : productId
});


await newReview.populate([
  {path : 'userId', select : '-password'},
  {path : 'productId'}
])

return res.status(201).json({message : "Review posted successfully",newReview});

}catch(error){
if(error.name === 'CastError'){
    return res.status(400).json({message : 'Data is provided in the invalid format !',error : error.message});
}

return res.status(500).json({message : 'Internal server error',error : error.message});
}
}

export const getAllReviews = async (req,res) => { 
try {
//Cursor-based pagination
const cursor = req.query.cursor;
const limit = parseInt(req.query.limit) || 10;
const productId = req.params.id;



//First check that this id is mapped to the product in our database or not 
const product = await Product.findById(productId);

const filter = {productId : productId};
if(cursor){
filter._id = {$gt : cursor};
}

if(!product) return res.status(404).json({message : 'Product not found'});


const all_reviews = await Review.find(filter)
.sort({_id : 1})
.limit(limit)
.populate('userId','-password')
.populate('productId');

const nextCursor = (all_reviews.length == limit)? all_reviews[all_reviews.length - 1]._id : null;


return res.status(200).json({
 all_reviews,
 nextCursor
});

} catch(error){
  if(error.name === 'CastError'){
    return res.status(400).json({message : 'Data is provided in the invalid format !',error : error.message});
  }
  return res.status(500).json({message : 'Internal server error',error : error.message});
}
}

export const getSingleReview = async (req,res) => {
  try {
    const id = req.params.id;

    const review = Review.findById(id)
    .populate('userId','-password')
    .populate('productId');

    if(!review) return res.status(404).json({message : 'Review not found'});

    return res.status(200).json(review);
  } catch(error){
    if(error.name == 'CastError'){
      return res.status(404).json({message : 'Data is provided in the invalid format',error : error.message});
    }
    return res.status(500).json({message : 'Internal server error', error : error.message});
  }

}

export const updateReview = async (req,res) => {
  try{
    const userId = req.user.id;
    const reviewId = req.params.id;
    const {rating,comment} = req.body;
    if(rating !== 0 && !rating && !comment){
      return res.status(400).json({message : 'You have not given any data to update!'});
    }

    
     const updateData = {};
     if(rating !== undefined) updateData.rating = rating;//we have written -> rating != undefined to handle rating 0, which has a 'falsy' value !!!!
     if(comment) updateData.comment = comment;

    const updatedReview = await Review.findOneAndUpdate({_id : reviewId,userId : userId},updateData,{new : true,runValidators : true})
    .populate('userId','-password')
    .populate('productId');


    

    if(!updatedReview){
      return res.status(404).json({message : 'Review not found or Cannot update this review !!!'});
    }

    return res.status(200).json(updatedReview);

  }catch(error){
    if(error.name === 'CastError'){
      return res.status(400).json({message : 'Data is provided in the invalid format !',error : error.message});
    }
    return res.status(500).json({message : 'Internal server error',error : error.message});
  }

}

export const deleteReview = async (req,res) => {
try {
  const reviewId = req.params.id;
  const userId   = req.user.id;
  const userRole = req.user.role;

  if(userRole === 'DeliveryBoy' || userRole === 'Seller'){//Avoiding any unvaild advantage/biased advantage to seller
    return res.status(403).json({message : 'You are not allowed to perform this action'});
  }

  let review;
  if(userRole === 'Admin'){
    review = await Review.findByIdAndDelete(reviewId);
  }else{
    review = await Review.findOneAndDelete({ _id: reviewId, userId : userId });
  }


  if(!review) return res.status(404).json({message : 'Review not found'});

  return res.status(200).json({message : 'Review deleted successfully'});//Send 'OK' response -> to indicate that the review is deleted successfully.
}catch(error){
  if(error.name === 'CastError'){
    return res.status(400).json({message : 'Data is provided in the invalid format !',error : error.message});
  }
  return res.status(500).json({message : 'Internal server error',error : error.message});
}

}