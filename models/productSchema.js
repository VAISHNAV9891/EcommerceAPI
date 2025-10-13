import express from 'express'

const productSchema = new mongoose.schema({
    name: {type: String, required: true, trim : true,minLength : 1},
    Brand : {type: String, required: true},
    price: {type: Number, required: [true,'Product Price is required'], min:[0,'Price cannot be negative']},
    description: {type: String, required: [true,'Product Description is required']},
    category: {type: String, required: true},
    stock: {type: Number, required: true, min:[0,'Stock cannot be negative'],default : 0}, 
    },
    { timestamps : true }
)


const Product = mongoose.model('Product',productSchema)

export default Product;