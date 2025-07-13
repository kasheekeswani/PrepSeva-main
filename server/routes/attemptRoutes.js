// server/routes/attemptRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitAttempt,
  getUserAttempts,
} = require('../controllers/attemptController');

router.post('/', submitAttempt);           // Submit test attempt
router.get('/:userId', getUserAttempts);   // Get all attempts by user

module.exports = router;
