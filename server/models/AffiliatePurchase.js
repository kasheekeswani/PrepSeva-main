const mongoose = require('mongoose');

const affiliatePurchaseSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amountPaid: Number,
  commissionEarned: Number,
  paymentId: String,
}, { timestamps: true });

module.exports = mongoose.model('AffiliatePurchase', affiliatePurchaseSchema);
