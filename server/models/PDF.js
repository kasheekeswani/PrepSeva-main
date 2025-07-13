// server/models/PDF.js
const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  examName: String,
  year: String,
  pdfUrl: { type: String, required: true },
  publicId: { type: String, required: true }, // for cloudinary delete
  uploadedAt: { type: Date, default: Date.now },

  // ✅ New fields:
  downloadCount: { type: Number, default: 0 },
  downloads: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('PDF', pdfSchema);
