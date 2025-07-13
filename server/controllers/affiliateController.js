const Razorpay = require('razorpay');
const Course = require('../models/Course');
const AffiliatePurchase = require('../models/AffiliatePurchase');
const AffiliateLink = require('../models/AffiliateLink');
const User = require('../models/User');

// ✅ Initialize Razorpay safely
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables.');
  } else {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized');
  }
} catch (error) {
  console.error('❌ Error initializing Razorpay:', error);
}

// ✅ Create Order with advanced error tracing
exports.createOrder = async (req, res) => {
  try {
    const { courseId, affiliateCode } = req.body;
    console.log('✅ Incoming createOrder:', { courseId, affiliateCode, user: req.user?._id });

    if (!razorpay) {
      console.error('❌ Razorpay is not initialized.');
      return res.status(500).json({ message: "Payment gateway configuration error." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.error('❌ Course not found:', courseId);
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.price || typeof course.price !== 'number' || course.price <= 0) {
      console.error('❌ Invalid course price:', course.price);
      return res.status(400).json({ message: "Invalid course price. Cannot create order." });
    }

    let affiliateId = null;

    if (affiliateCode) {
      const affiliateLink = await AffiliateLink.findOne({ code: affiliateCode });
      if (affiliateLink) {
        affiliateId = affiliateLink.affiliateId;
      } else {
        console.warn('⚠️ Invalid affiliate code:', affiliateCode);
      }
    }

    const amountInPaise = Math.round(course.price * 100);

    // Attempt to create order
    let order;
    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_course_${courseId}_${Date.now()}`,
        notes: {
          courseId,
          affiliateId: affiliateId ? affiliateId.toString() : '',
          affiliateCode: affiliateCode || ''
        }
      });
      console.log('✅ Razorpay order created:', order.id);
    } catch (rzpError) {
      console.error('❌ Razorpay order creation error:', rzpError);
      const errorMessage = rzpError.error?.description || 'Payment gateway error while creating order.';
      return res.status(500).json({ message: errorMessage });
    }

    res.json({ order, affiliateId });
  } catch (error) {
    console.error('❌ Error in createOrder:', error);
    res.status(500).json({ message: error.message || 'Internal server error while creating order' });
  }
};

// ✅ Verify payment and save purchase
exports.verifyAndSavePurchase = async (req, res) => {
  try {
    const { courseId, affiliateCode, paymentId } = req.body;
    console.log('✅ Incoming verifyAndSavePurchase:', { courseId, affiliateCode, paymentId, user: req.user?._id });

    const course = await Course.findById(courseId);
    if (!course) {
      console.error('❌ Course not found during verification:', courseId);
      return res.status(404).json({ message: "Course not found" });
    }

    let affiliateId = null;
    let affiliateLink = null;

    if (affiliateCode) {
      affiliateLink = await AffiliateLink.findOne({ code: affiliateCode });
      if (affiliateLink) {
        affiliateId = affiliateLink.affiliateId;
        await AffiliateLink.findByIdAndUpdate(affiliateLink._id, { $inc: { conversions: 1 } });
      }
    }

    const commission = affiliateId ? (course.affiliateCommission / 100) * course.price : 0;

    const purchase = new AffiliatePurchase({
      course: courseId,
      buyer: req.user._id,
      affiliate: affiliateId,
      amountPaid: course.price,
      commissionEarned: commission,
      paymentId,
      affiliateCode: affiliateCode || null
    });

    await purchase.save();

    if (affiliateLink) {
      await AffiliateLink.findByIdAndUpdate(affiliateLink._id, { $inc: { earnings: commission } });
    }

    console.log('✅ Purchase verified and saved:', purchase._id);
    res.json({ success: true, purchase });
  } catch (error) {
    console.error('❌ Error in verifyAndSavePurchase:', error);
    res.status(500).json({ message: error.message || 'Internal server error while verifying purchase' });
  }
};

// ✅ Get affiliate earnings
exports.getEarnings = async (req, res) => {
  try {
    const earnings = await AffiliatePurchase.aggregate([
      { $match: { affiliate: req.user._id } },
      { $group: { _id: null, total: { $sum: "$commissionEarned" } } }
    ]);
    res.json({ totalEarned: earnings[0]?.total || 0 });
  } catch (error) {
    console.error('❌ Error in getEarnings:', error);
    res.status(500).json({ message: error.message || 'Error fetching earnings' });
  }
};

// ✅ Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await AffiliatePurchase.aggregate([
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
    res.json(leaderboard);
  } catch (error) {
    console.error('❌ Error in getLeaderboard:', error);
    res.status(500).json({ message: error.message || 'Error fetching leaderboard' });
  }
};
