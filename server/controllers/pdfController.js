// server/controllers/pdfController.js
const PDF = require('../models/PDF');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const fs = require('fs');

// Storage: save locally before upload
const upload = multer({ dest: 'uploads/' });

exports.uploadPDF = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, examName, year } = req.body;
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'raw',
        folder: 'prepseva/pdfs',
      });

      const newPdf = new PDF({
        title,
        examName,
        year,
        pdfUrl: result.secure_url,
        publicId: result.public_id,
      });

      await newPdf.save();
      fs.unlinkSync(req.file.path);
      res.status(201).json(newPdf);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Upload failed' });
    }
  },
];

exports.getAllPDFs = async (req, res) => {
  const pdfs = await PDF.find().sort({ uploadedAt: -1 });
  res.json(pdfs);
};

exports.deletePDF = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'Not found' });

    await cloudinary.uploader.destroy(pdf.publicId, { resource_type: 'raw' });
    await PDF.findByIdAndDelete(req.params.id);

    res.json({ message: 'PDF deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

// ✅ New: Track PDF download
exports.incrementDownload = async (req, res) => {
  const { pdfId, userId } = req.body;

  try {
    const pdf = await PDF.findById(pdfId);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    pdf.downloadCount += 1;

    if (userId) {
      pdf.downloads.push({ userId });
    }

    await pdf.save();
    res.json({ message: 'Download tracked' });
  } catch (err) {
    console.error('Download tracking error:', err);
    res.status(500).json({ error: 'Failed to track download' });
  }
};
