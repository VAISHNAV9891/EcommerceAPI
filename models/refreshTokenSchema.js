import mongoose from 'mongoose';

const refreshTokenSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    tokenHash : {
        type : String,
        required : true,
        unique : true
    },
    expiresAt : {
        type : Date,
        required : true
    },
    used : {
      type : Boolean,
      default : false
    }
});

refreshTokenSchema.index({expiresAt : 1}, {expireAfterSeconds : 0});

const RefreshToken = mongoose.model('RefreshToken',refreshTokenSchema);

export default RefreshToken;