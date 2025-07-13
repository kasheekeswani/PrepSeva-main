// server/controllers/bookmarkController.js
const Bookmark = require('../models/Bookmark');

exports.addBookmark = async (req, res) => {
  const { userId, questionId } = req.body;

  try {
    const newBookmark = new Bookmark({ userId, questionId });
    const saved = await newBookmark.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Already bookmarked' });
    }
    console.error('Error adding bookmark:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

exports.getBookmarks = async (req, res) => {
  const { userId } = req.params;

  try {
    const bookmarks = await Bookmark.find({ userId }).populate('questionId');
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

exports.removeBookmark = async (req, res) => {
  const { userId, questionId } = req.body;

  try {
    await Bookmark.findOneAndDelete({ userId, questionId });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};
