import mongoose from 'mongoose'




const productSchema = new mongoose.Schema({
    name: {type: String, required: true, trim : true,minLength : 1},
    image: { 
        type: String, 
        default : "https://placehold.co/600x400" // Default dummy image
    },
    brand : {type: String, required: true},
    price: {type: Number, required: [true,'Product Price is required'], min:[0,'price cannot be negative !!!']},
    description: {type: String, required: [true,'Product Description is required']},
    category: {type: String, required: true},
    stock: {type: Number, required: true, min:[0,'Stock cannot be negative'],default : 0}, 
    },
    { timestamps : true }
)


const Product = mongoose.model('Product',productSchema)

export default Product;