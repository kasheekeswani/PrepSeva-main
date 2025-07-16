const razorpay = require('../config/razorpay');
const Course = require('../models/Course');
const AffiliatePurchase = require('../models/AffiliatePurchase');
const AffiliateLink = require('../models/AffiliateLink');
const User = require('../models/User');
const crypto = require('crypto');

// Helper to generate unique Razorpay receipt ID
const generateShortReceipt = (courseId) => {
  const timestamp = Date.now().toString().slice(-8);
  const courseIdShort = courseId.toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `rcpt_${courseIdShort}_${timestamp}_${random}`.substring(0, 40);
};

exports.createOrder = async (req, res) => {
  try {
    const { courseId, affiliateCode } = req.body;
    const userId = req.user?._id;

    if (!courseId || !userId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const amountInPaise = Math.round(course.price * 100);
    let affiliateId = null;

    if (affiliateCode) {
      const affiliateLink = await AffiliateLink.findOne({ affiliateCode });
      if (affiliateLink) {
        affiliateId = affiliateLink.affiliate;
      }
    }

    const shortReceipt = generateShortReceipt(courseId);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        courseId: courseId.toString(),
        affiliateId: affiliateId?.toString() || '',
        affiliateCode: affiliateCode || '',
        buyerId: userId.toString()
      }
    });

    res.status(200).json({ order });
  } catch (error) {
    console.error('❌ Error in createOrder:', error.message);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

exports.verifyAndSavePurchase = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      affiliateCode
    } = req.body;

    const userId = req.user?._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId || !userId) {
      return res.status(400).json({ message: "Missing payment verification data" });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let affiliateId = null;
    let affiliateLink = null;
    let commission = 0;

    if (affiliateCode) {
      affiliateLink = await AffiliateLink.findOne({ affiliateCode });
      if (affiliateLink) {
        affiliateId = affiliateLink.affiliate;
        await AffiliateLink.findByIdAndUpdate(affiliateLink._id, { $inc: { conversions: 1 } });
        commission = (course.affiliateCommission / 100) * course.price;
      }
    }

    const purchase = new AffiliatePurchase({
      course: courseId,
      buyer: userId,
      affiliate: affiliateId,
      amountPaid: course.price,
      commissionEarned: commission,
      paymentId: razorpay_payment_id,
      affiliateCode: affiliateCode || null,
      status: 'completed'
    });

    await purchase.save();

    if (affiliateLink && commission > 0) {
      await AffiliateLink.findByIdAndUpdate(affiliateLink._id, { $inc: { earnings: commission } });
    }

    res.status(200).json({ success: true, purchase });
  } catch (error) {
    console.error('❌ Error in verifyAndSavePurchase:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const earnings = await AffiliatePurchase.aggregate([
      { $match: { affiliate: req.user._id } },
      { $group: { _id: null, total: { $sum: "$commissionEarned" } } }
    ]);

    res.status(200).json({
      totalEarned: earnings[0]?.total || 0
    });
  } catch (error) {
    console.error('❌ Error fetching earnings:', error.message);
    res.status(500).json({ message: "Error fetching earnings", error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await AffiliatePurchase.aggregate([
      { $match: { affiliate: { $ne: null } } },
      {
        $group: {
          _id: "$affiliate",
          totalCommission: { $sum: "$commissionEarned" },
          totalSales: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "affiliateUser"
        }
      },
      { $unwind: "$affiliateUser" },
      {
        $project: {
          name: "$affiliateUser.name",
          email: "$affiliateUser.email",
          totalCommission: 1,
          totalSales: 1
        }
      },
      { $sort: { totalCommission: -1 } },
      { $limit: 50 }
    ]);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error.message);
    res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
};
