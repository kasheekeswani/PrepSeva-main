const AffiliateLink = require('../models/AffiliateLink');
const Course = require('../models/Course');
const QRCode = require('qrcode');
const razorpay = require('../config/razorpay');

// Create a new affiliate link
const generateAffiliateLink = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Validate if the user already has a link for this course
    const existingLink = await AffiliateLink.findOne({ affiliate: userId, course: courseId });
    if (existingLink) {
      return res.status(200).json({
        message: 'Affiliate link already exists for this course.',
        link: existingLink,
        sharableLink: existingLink.fullUrl
      });
    }

    // Generate a unique affiliate code
    const code = await AffiliateLink.generateUniqueCode(userId, courseId);

    // Construct the sharable URL
    const url = `${process.env.BASE_URL}/courses/${courseId}?ref=${code}`;

    const newLink = new AffiliateLink({
      affiliate: userId,
      course: courseId,
      affiliateCode: code,
      fullUrl: url,
      shortUrl: code
    });

    await newLink.save();

    res.status(201).json({
      message: 'Affiliate link created successfully.',
      link: newLink,
      sharableLink: url
    });
  } catch (err) {
    console.error('❌ Error generating affiliate link:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all affiliate links for a user with pagination & filter
const getAffiliateLinks = async (req, res) => {
  try {
    const { page = 1, status } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { affiliate: req.user.id };
    if (status && status !== 'all') query.status = status;

    const links = await AffiliateLink.find(query)
      .populate('course')
      .skip(skip)
      .limit(limit);

    const total = await AffiliateLink.countDocuments(query);

    res.status(200).json({
      affiliateLinks: links,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('❌ Error fetching affiliate links:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single affiliate link
const getAffiliateLink = async (req, res) => {
  try {
    const link = await AffiliateLink.findById(req.params.id).populate('course');
    if (!link) {
      return res.status(404).json({ message: 'Affiliate link not found' });
    }
    res.status(200).json(link);
  } catch (err) {
    console.error('❌ Error fetching single affiliate link:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track click
const trackClick = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await AffiliateLink.findOne({ affiliateCode: token });
    if (!link) {
      return res.status(404).json({ message: 'Invalid affiliate link' });
    }

    await link.trackClick({
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer') || '',
      country: 'Unknown',
      city: 'Unknown',
      device: 'Unknown'
    });

    res.status(200).json({ message: 'Click tracked successfully' });
  } catch (err) {
    console.error('❌ Error tracking click:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track conversion
const trackConversion = async (req, res) => {
  try {
    const { code, clickIndex, amount } = req.body;
    const link = await AffiliateLink.findOne({ affiliateCode: code });
    if (!link) {
      return res.status(404).json({ message: 'Invalid affiliate code' });
    }

    await link.trackConversion(clickIndex, amount);
    res.status(200).json({ message: 'Conversion tracked successfully' });
  } catch (err) {
    console.error('❌ Error tracking conversion:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate QR Code
const generateQRCode = async (req, res) => {
  try {
    const link = await AffiliateLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Affiliate link not found' });
    }

    const qr = await QRCode.toDataURL(link.fullUrl);
    res.status(200).json({ qr });
  } catch (err) {
    console.error('❌ Error generating QR code:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get analytics with expanded overview structure
const getAnalytics = async (req, res) => {
  try {
    const links = await AffiliateLink.find({ affiliate: req.user.id });
    const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
    const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);
    const totalEarnings = links.reduce((sum, l) => sum + (l.earnings || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    res.status(200).json({
      overview: {
        totalClicks,
        totalConversions,
        totalRevenue: totalEarnings,
        conversionRate
      },
      clicksData: [],
      revenueData: []
    });
  } catch (err) {
    console.error('❌ Error fetching analytics:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Order with affiliate tracking
const createOrder = async (req, res) => {
  try {
    const { courseId, affiliateCode } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      console.error(`❌ Course not found: ${courseId}`);
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.price) {
      console.error(`❌ Course price is missing for courseId: ${courseId}`);
      return res.status(400).json({ message: "Course price is missing" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay keys missing in environment variables.");
      return res.status(500).json({ message: "Server configuration error: Razorpay keys missing" });
    }

    let affiliateId = null;
    if (affiliateCode) {
      const affiliateLink = await AffiliateLink.findOne({ affiliateCode });
      if (affiliateLink) {
        affiliateId = affiliateLink.affiliate.toString();
      }
    }

    const order = await razorpay.orders.create({
      amount: Math.round(course.price * 100),
      currency: "INR",
      receipt: `receipt_course_${courseId}_${Date.now()}`,
      notes: { courseId, affiliateId, affiliateCode }
    });

    console.log("✅ Razorpay order created:", order.id);

    res.json({ order, affiliateId });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ message: error.message || "Internal Server Error", stack: error.stack });
  }
};

module.exports = {
  generateAffiliateLink,
  getAffiliateLinks,
  getAffiliateLink,
  trackClick,
  trackConversion,
  generateQRCode,
  getAnalytics,
  createOrder
};
