const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyAndSavePurchase,
  getEarnings,
  getLeaderboard
} = require('../controllers/affiliateController');
const auth = require('../middleware/auth');

console.log('✅ Affiliate routes loaded');

router.post('/order', auth.user, (req, res, next) => {
  console.log('🔍 Handling POST /api/affiliate/order');
  createOrder(req, res, next);
});
router.post('/verify', auth.user, (req, res, next) => {
  console.log('🔍 Handling POST /api/affiliate/verify');
  verifyAndSavePurchase(req, res, next);
});
router.get('/earnings', auth.user, getEarnings);
router.get('/leaderboard', auth.admin, getLeaderboard);

module.exports = router;