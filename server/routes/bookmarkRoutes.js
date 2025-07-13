// server/routes/bookmarkRoutes.js
const express = require('express');
const router = express.Router();
const {
  addBookmark,
  getBookmarks,
  removeBookmark,
} = require('../controllers/bookmarkController');

router.post('/', addBookmark);
router.get('/:userId', getBookmarks);
router.delete('/', removeBookmark);

module.exports = router;
