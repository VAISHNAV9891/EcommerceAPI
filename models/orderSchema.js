import mongoose from 'mongoose'


const orderSchema = mongoose.Schema({
user : {type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true},
items : [{
    product : {type : mongoose.Schema.Types.ObjectId, ref : 'Product'},
    quantity : {type : Number, required : true, min : 1}
}],


totalPrice : {type : Number, min : [0,'Total Price cannot be negative !!!']},
shippingAddress : {type : String, required : true},
orderDate : {type : Date, default : Date.now},
status : {type : String, enum : ['Pending','Shipped','Delivered','Cancelled','Out for delivery'],default : 'Pending'},
paymentStatus : {type : String, enum : ['Pending', 'Successful', 'Failed'], default : 'Pending'},
paymentId : {type : String, default : ""}
},
{timestamps : true})

const Order = mongoose.model('Order',orderSchema)

export default Order;