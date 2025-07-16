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

router.post('/order', auth.user, createOrder);
router.post('/verify', auth.user, verifyAndSavePurchase);
router.get('/earnings', auth.user, getEarnings);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
