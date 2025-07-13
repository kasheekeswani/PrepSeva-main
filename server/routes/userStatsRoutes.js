// server/routes/userStatsRoutes.js
const express = require('express');
const router = express.Router();
const { getUserStats, getAllUserStats } = require('../controllers/userStatsController');

// Single user's stats (by ID)
router.get('/:userId', getUserStats);

// Admin panel: all users' test completion stats
router.get('/', getAllUserStats);

module.exports = router;
