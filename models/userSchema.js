import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : {type : String, required : true, unique : true},
    email : {type : String, required : true, unique : true},
    password : {type : String, required : true},
    role : {type : String, enum : ['Customer','admin','Seller','DeliveryBoy'], default : 'Customer'}
},
{timestamps : true}//Important Thing
)

const User = mongoose.model('User',userSchema);


export default User;
