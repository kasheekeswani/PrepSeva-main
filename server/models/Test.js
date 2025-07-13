// server/models/Test.js
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF' },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ✅ Add this
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Test', testSchema);


