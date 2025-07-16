// server/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { getTestsByPdf } = require('../controllers/testController');

router.get('/pdf/:pdfId', getTestsByPdf);

// GET all tests
router.get('/', testController.getAllTests);

// GET a single test by ID
router.get('/:id', testController.getTestById);

// ✅ CREATE a new test (supports scheduling)
router.post('/create', testController.createTest);

// CREATE a new test
router.post('/', testController.createTest);

// UPDATE a test
router.put('/:id', testController.updateTest);

// DELETE a test
router.delete('/:id', testController.deleteTest);

// ✅ SUBMIT a test attempt
router.post('/submit', testController.submitTest);

module.exports = router;
