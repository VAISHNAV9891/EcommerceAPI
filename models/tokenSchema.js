// models/Token.js
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
    index: { expires: 0 } // TTL index: auto-delete expired tokens
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Token = mongoose.model('Token',tokenSchema);
export default Token;
