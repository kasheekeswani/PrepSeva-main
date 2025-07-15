const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// ✅ IMPORTANT: Load environment variables FIRST
dotenv.config();

// ✅ Add debug logging to verify env vars are loaded
console.log('🔍 Environment variables loaded:');
console.log('✅ RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('✅ RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');

const app = express();

// ✅ Import Razorpay AFTER dotenv.config()
const razorpay = require('./config/razorpay');

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// ✅ Razorpay Test Route
app.get('/api/test-razorpay', async (req, res) => {
  try {
    console.log('✅ Test Razorpay endpoint hit');
    
    if (!razorpay) {
      return res.status(500).json({
        message: 'Razorpay instance is null - check your credentials'
      });
    }

    const order = await razorpay.orders.create({
      amount: 1000, // 10 INR in paise
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`
    });

    console.log('✅ Test order created:', order);
    res.json(order);
  } catch (error) {
    console.error('❌ Test Razorpay error:', error);
    res.status(500).json({
      message: error.error?.description || error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      error: error
    });
  }
});

// ✅ Route Imports
const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testRoutes = require('./routes/testRoutes');
const statsRoutes = require('./routes/statsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const userRoutes = require('./routes/userRoutes');
const userStatsRoutes = require('./routes/userStatsRoutes');
const faqRoutes = require('./routes/faqRoutes');

// ✅ New Affiliate & Course Routes
const courseRoutes = require('./routes/courseRoutes');
const affiliateRoutes = require('./routes/affiliateRoutes');
const affiliateLinkRoutes = require('./routes/affiliateLinkRoutes');

// ✅ Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/userstats', userStatsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/affiliate-links', affiliateLinkRoutes);
app.use('/api/faqs', faqRoutes);

// ✅ Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ MongoDB & Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });


