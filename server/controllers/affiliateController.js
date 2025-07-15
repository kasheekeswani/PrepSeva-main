const razorpay = require('../config/razorpay');
const Course = require('../models/Course');
const AffiliatePurchase = require('../models/AffiliatePurchase');
const AffiliateLink = require('../models/AffiliateLink');
const User = require('../models/User');
const crypto = require('crypto');

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

    console.log('✅ Incoming createOrder:', {
      courseId,
      affiliateCode,
      user: userId,
      userRole: req.user?.role
    });

    if (!courseId) {
      console.error('❌ Course ID missing');
      return res.status(400).json({ status: 400, message: "Course ID is required" });
    }

    if (!userId) {
      console.error('❌ User ID missing from token');
      return res.status(401).json({ status: 401, message: "User not authenticated" });
    }

    if (!razorpay) {
      console.error('❌ Razorpay instance not initialized');
      return res.status(500).json({ status: 500, message: "Payment gateway not initialized. Contact support." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.error('❌ Course not found:', courseId);
      return res.status(404).json({ status: 404, message: "Course not found" });
    }

    const amountInPaise = Math.round(course.price * 100);
    let affiliateId = null;

    if (affiliateCode) {
      const affiliateLink = await AffiliateLink.findOne({ affiliateCode });
      if (affiliateLink) {
        affiliateId = affiliateLink.affiliate;
        console.log('✅ Found affiliate:', affiliateId);
      } else {
        console.warn('⚠️ Invalid affiliate code:', affiliateCode);
      }
    }

    const shortReceipt = generateShortReceipt(courseId);

    const orderData = {
      amount: amountInPaise,
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        courseId: courseId.toString(),
        affiliateId: affiliateId ? affiliateId.toString() : '',
        affiliateCode: affiliateCode || '',
        buyerId: userId.toString()
      }
    };

    console.log('✅ Creating order with receipt:', shortReceipt, 'Length:', shortReceipt.length);

    const order = await razorpay.orders.create(orderData);

    res.status(200).json({ status: 200, order });
  } catch (error) {
    console.error('❌ Error in createOrder:', error.message);
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: error.statusCode,
        message: `Razorpay error: ${error.error?.description || error.message}`
      });
    }

    res.status(500).json({
      status: 500,
      message: "Error creating order",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.verifyAndSavePurchase = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, affiliateCode } = req.body;
    const userId = req.user?._id;

    console.log('✅ Incoming verifyAndSavePurchase:', {
      razorpay_order_id,
      razorpay_payment_id,
      courseId,
      affiliateCode,
      user: userId
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing payment verification data');
      return res.status(400).json({ message: "Missing payment verification data" });
    }

    if (!courseId) {
      console.error('❌ Missing courseId');
      return res.status(400).json({ message: "Course ID is required" });
    }

    if (!userId) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ message: "User not authenticated" });
    }

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid Razorpay signature');
      return res.status(400).json({ message: "Invalid payment signature. Verification failed." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.error('❌ Course not found:', courseId);
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
      } else {
        console.warn('⚠️ Invalid affiliate code:', affiliateCode);
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

    console.log('✅ Purchase verified and saved:', { purchaseId: purchase._id, commission, affiliateId });

    res.status(200).json({ success: true, purchase });
  } catch (error) {
    console.error('❌ Error in verifyAndSavePurchase:', error.message);
    res.status(500).json({
      message: error.message || "Error verifying and saving purchase",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const earnings = await AffiliatePurchase.aggregate([
      { $match: { affiliate: req.user._id } },
      { $group: { _id: null, total: { $sum: "$commissionEarned" } } }
    ]);

    res.status(200).json({
      status: 200,
      totalEarned: earnings[0]?.total || 0
    });
  } catch (error) {
    console.error('❌ Error in getEarnings:', error.message);
    res.status(500).json({
      status: 500,
      message: "Error fetching earnings",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await AffiliatePurchase.aggregate([
      { $match: { affiliate: { $ne: null } } },
      { $group: { _id: "$affiliate", totalCommission: { $sum: "$commissionEarned" }, totalSales: { $sum: 1 } } },
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

    res.status(200).json({
      status: 200,
      leaderboard
    });
  } catch (error) {
    console.error('❌ Error in getLeaderboard:', error.message);
    res.status(500).json({
      status: 500,
      message: "Error fetching leaderboard",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};