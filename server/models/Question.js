// server/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDF',
    required: false, // Optional if linked only to tests
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: false, // Required for test-taking
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length >= 2 && arr.length <= 6;
      },
      message: 'Question must have between 2-6 options',
    },
  },
  correctAnswer: {
    type: Number, // index of correct option (0-based)
    required: true,
    min: 0,
    validate: {
      validator: function (value) {
        return value < this.options.length;
      },
      message: 'Correct answer index must be valid for the given options',
    },
  },
  explanation: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for faster lookups
questionSchema.index({ testId: 1 });
questionSchema.index({ pdfId: 1 });

module.exports = mongoose.model('Question', questionSchema);
