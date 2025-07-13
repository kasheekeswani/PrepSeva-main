const express = require('express');
const router = express.Router();

const {
  generateAffiliateLink,
  getAffiliateLinks,
  getAffiliateLink,
  trackClick,
  trackConversion,
  generateQRCode,
  getAnalytics
} = require('../controllers/affiliateLinkController');

const auth = require('../middleware/auth'); // Correct file path

// Routes
router.post('/create', auth.user, generateAffiliateLink);         // Protected: any authenticated user
router.get('/my-links', auth.user, getAffiliateLinks);            // Protected: user
router.get('/link/:id', auth.user, getAffiliateLink);             // Protected: user
router.get('/track/:token', trackClick);                          // Public
router.post('/conversion', trackConversion);                      // Public (e.g., for post-purchase tracking)
router.get('/qr/:id', auth.user, generateQRCode);                 // Protected: user
router.get('/analytics', auth.admin, getAnalytics);               // Admin-only route

module.exports = router;
