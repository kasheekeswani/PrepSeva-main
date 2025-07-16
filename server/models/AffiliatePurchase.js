const mongoose = require('mongoose');

const affiliatePurchaseSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  amountPaid: {
    type: Number,
    required: true
  },
  commissionEarned: {
    type: Number,
    required: true,
    default: 0
  },
  paymentId: {
    type: String,
    required: true
  },
  affiliateCode: {
    type: String,
    required: false,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('AffiliatePurchase', affiliatePurchaseSchema);
