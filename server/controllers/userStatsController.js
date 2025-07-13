// server/controllers/userStatsController.js
const TestAttempt = require('../models/TestAttempt');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

exports.getUserStats = async (req, res) => {
  const { userId } = req.params;

  try {
    const attempts = await TestAttempt.find({ userId });
    const totalTests = attempts.length;
    const avgScore =
      totalTests > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalTests
          )
        : 0;

    const bookmarkCount = await Bookmark.countDocuments({ userId });

    res.json({
      totalTests,
      avgScore,
      bookmarks: bookmarkCount,
    });
  } catch (err) {
    console.error('Error getting user stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// ✅ For admin panel user stats table
exports.getAllUserStats = async (req, res) => {
  try {
    const users = await User.find({}, '_id name email');
    const attempts = await TestAttempt.aggregate([
      { $group: { _id: '$userId', testCount: { $sum: 1 } } },
    ]);

    const attemptMap = new Map();
    attempts.forEach((a) => {
      attemptMap.set(String(a._id), a.testCount);
    });

    const userTestData = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      testCount: attemptMap.get(String(user._id)) || 0,
    }));

    res.json({
      totalUsers: users.length,
      activeUsers: attemptMap.size,
      avgTestsPerUser:
        users.length > 0
          ? (attempts.reduce((sum, a) => sum + a.testCount, 0) / users.length).toFixed(1)
          : 0,
      userTestData,
    });
  } catch (err) {
    console.error('Error fetching all user stats:', err);
    res.status(500).json({ error: 'Failed to fetch all user stats' });
  }
};
