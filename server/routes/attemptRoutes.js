// server/routes/attemptRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitAttempt,
  getUserAttempts,
  getAllAttempts,
} = require('../controllers/attemptController');

router.post('/', submitAttempt);
router.get('/', getAllAttempts);          
router.get('/:userId', getUserAttempts);  
 
module.exports = router;
