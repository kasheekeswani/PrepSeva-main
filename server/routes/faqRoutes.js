// routes/faqRoutes.js
const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const auth = require('../middleware/auth');

// Public routes - these should come first
router.get('/active', faqController.getActiveFAQs);
router.get('/search', faqController.searchFAQs);
router.get('/categories', faqController.getFAQCategories);

// Admin routes - these should come before the generic /:id route
//router.get('/admin/stats', auth, faqController.getFAQStats);
//router.get('/admin/all', auth, faqController.getAllFAQs); // Changed from '/' to '/admin/all'
//router.post('/admin/create', auth, faqController.createFAQ); // Changed from '/' to '/admin/create'
//router.put('/admin/:id', auth, faqController.updateFAQ); // Changed to '/admin/:id'
//router.delete('/admin/:id', auth, faqController.deleteFAQ); // Changed to '/admin/:id'

// Public route for getting FAQ by ID - this should come last
router.get('/:id', faqController.getFAQById);

module.exports = router;
