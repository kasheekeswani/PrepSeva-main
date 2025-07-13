// server/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const {
  uploadPDF,
  getAllPDFs,
  deletePDF,
  incrementDownload, // ✅ new
} = require('../controllers/pdfController');

router.post('/upload', uploadPDF);
router.get('/', getAllPDFs);
router.delete('/:id', deletePDF);

// ✅ New: track PDF downloads
router.post('/track-download', incrementDownload);

module.exports = router;
