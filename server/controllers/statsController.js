// server/controllers/statsController.js
const User = require('../models/User');
const Test = require('../models/Test');
const mongoose = require('mongoose');

exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const tests = await Test.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    const totalTests = tests.reduce((acc, obj) => acc + obj.count, 0);
    const avgTestsPerUser = totalUsers ? (totalTests / totalUsers).toFixed(2) : 0;

    const userTestData = await User.aggregate([
      {
        $lookup: {
          from: 'tests',
          localField: '_id',
          foreignField: 'userId',
          as: 'tests'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          testCount: { $size: '$tests' }
        }
      }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      avgTestsPerUser,
      userTestData
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};


