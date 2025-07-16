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

const auth = require('../middleware/auth');

console.log('✅ Affiliate link routes loaded');

router.post('/create', auth.user, generateAffiliateLink);
router.get('/my-links', auth.user, getAffiliateLinks);
router.get('/link/:id', auth.user, getAffiliateLink);
router.get('/track/:token', trackClick);
router.post('/conversion', trackConversion);
router.get('/qr/:id', auth.user, generateQRCode);
router.get('/analytics', auth.admin, getAnalytics);

module.exports = router;
