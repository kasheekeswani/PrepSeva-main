const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.user = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error('❌ No token provided in Authorization header');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { id: decoded.id });

    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('❌ User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found, please log in again' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.admin = async (req, res, next) => {
  await exports.user(req, res, async () => {
    if (req.user.role !== 'admin') {
      console.error('❌ Admin access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};