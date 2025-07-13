const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: String,
    enum: ['general', 'courses', 'exams', 'affiliate', 'technical', 'payment'],
    default: 'general'
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for text search
faqSchema.index({ question: 'text', answer: 'text', keywords: 'text' });

// Index for category and priority
faqSchema.index({ category: 1, priority: -1 });

module.exports = mongoose.model('FAQ', faqSchema);
