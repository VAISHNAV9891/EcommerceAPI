import express from 'express'
import mongoose from 'mongoose'


const orderSchema = mongoose.Schema({
items : [{
    product : {type : mongoose.Schema.Types.ObjectId, ref : 'Product'},
    quantity : {type : Number, required : true, min : 1}
}],

totalPrice : {type : Number,required : true, min : [0,'Total Price cannot be negative !!!']},
shippingAddress : {type : String, required : true},
orderDate : {type : Date, default : Date.now},
status : {type : String, enum : ['Pending','Shipped','Delivered','Cancelled','Out for Delivery'],default : 'Pending'}
},
{timestamps : true})

const Order = mongoose.model('Order',orderSchema)

export default Order;