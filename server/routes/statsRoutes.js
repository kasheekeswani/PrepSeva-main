const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/statsController');

router.get('/users', getUserStats);

module.exports = router;


