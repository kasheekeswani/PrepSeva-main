const mongoose = require('mongoose');

const affiliateLinkSchema = new mongoose.Schema({
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  affiliateCode: {
    type: String,
    required: true,
    unique: true
  },
  fullUrl: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    unique: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  clickData: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    referer: String,
    country: String,
    city: String,
    device: String,
    converted: { type: Boolean, default: false }
  }],
  earnings: {
    type: Number,
    default: 0
  },
  commissionRate: {
    type: Number,
    default: 0.1
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  lastClickAt: Date,
  notes: String,
  customParams: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

affiliateLinkSchema.index({ affiliate: 1, course: 1 });
affiliateLinkSchema.index({ affiliateCode: 1 });
affiliateLinkSchema.index({ shortUrl: 1 });
affiliateLinkSchema.index({ createdAt: -1 });

affiliateLinkSchema.virtual('conversionRate').get(function () {
  return this.clicks > 0 ? (this.conversions / this.clicks * 100).toFixed(2) : 0;
});

affiliateLinkSchema.statics.generateUniqueCode = async function (userId, courseId) {
  const userIdStr = userId.toString().slice(-4);
  const courseIdStr = courseId.toString().slice(-4);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  let code = `${userIdStr}${courseIdStr}${timestamp}${random}`;
  let existingLink = await this.findOne({ affiliateCode: code });
  while (existingLink) {
    const newRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `${userIdStr}${courseIdStr}${timestamp}${newRandom}`;
    existingLink = await this.findOne({ affiliateCode: code });
  }

  return code;
};

affiliateLinkSchema.methods.trackClick = function (clickData) {
  this.clicks += 1;
  this.lastClickAt = new Date();
  this.clickData.push({ ...clickData, timestamp: new Date(), converted: false });
  return this.save();
};

affiliateLinkSchema.methods.trackConversion = function (clickIndex, purchaseAmount) {
  this.conversions += 1;
  if (clickIndex !== undefined && this.clickData[clickIndex]) {
    this.clickData[clickIndex].converted = true;
  }
  this.earnings += purchaseAmount * this.commissionRate;
  return this.save();
};

affiliateLinkSchema.methods.getPerformanceStats = function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const recentClicks = this.clickData.filter(click => click.timestamp >= startDate);
  const recentConversions = recentClicks.filter(click => click.converted);

  return {
    totalClicks: this.clicks,
    totalConversions: this.conversions,
    totalEarnings: this.earnings,
    recentClicks: recentClicks.length,
    recentConversions: recentConversions.length,
    conversionRate: this.clicks > 0 ? (this.conversions / this.clicks * 100).toFixed(2) : 0,
    recentConversionRate: recentClicks.length > 0 ? (recentConversions.length / recentClicks.length * 100).toFixed(2) : 0
  };
};

module.exports = mongoose.model('AffiliateLink', affiliateLinkSchema);
