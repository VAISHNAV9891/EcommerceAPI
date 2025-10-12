import express from 'express'
import mongoose from 'mongoose'


const orderSchema = mongoose.schema({
items : [{
    product : {type : mongoose.schema.Types.ObjectId, ref : 'Product'},
    quantity : {type : Number, required : true, min : 1}
}],
totalPrice : {type : Number, required : true},
shippingAddress : {type : String, required : true},
orderDate : {type : Date, default : Date.now},
status : {type : String, enum : ['Pending','Shipped','Delivered','Cancelled'],default : 'Pending'}
},
{timestamps : true})

const Order = mongoose.model('Order',orderSchema)

export default Order;