const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF' },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Creator/admin ID
  startTime: { type: Date, required: true }, // Scheduled start time
  duration: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Test', testSchema);
