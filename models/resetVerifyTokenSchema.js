import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  purpose: {
    type: String,
    enum: ['RESET_PASSWORD', 'EMAIL_VERIFY'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

//Create a index at the field 'expiresAt' which is sorted in ascending order
tokenSchema.index({expiresAt : 1}, {expireAfterSeconds : 0});

const Token = mongoose.model('Token',tokenSchema);
export default Token;
