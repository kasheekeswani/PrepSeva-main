// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');

router.get('/:id', getUserProfile);       // View user profile
router.put('/:id', updateUserProfile);    // Update name/email/password

module.exports = router;
