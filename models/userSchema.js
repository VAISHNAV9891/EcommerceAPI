import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    orders : [{type : mongoose.Schema.Types.ObjectId, ref : 'Order'}],
    username : {type : String, required : true, unique : true},
    email : {type : String, required : true, unique : true},
    password : {type : String, required : true, minLength : [8,'Password must be at least 8 characters long']},
    role : {type : String, enum : ['Customer','Admin','Seller','DeliveryBoy'], default : 'Customer'},
    cart : {type : mongoose.Schema.Types.ObjectId, ref : 'Cart'}
},
{timestamps : true}//Important Thing
)

const User = mongoose.model('User',userSchema);


export default User;
