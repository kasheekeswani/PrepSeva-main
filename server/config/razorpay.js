const Razorpay = require('razorpay');

setTimeout(() => {
  console.log('🔍 Razorpay config - checking environment variables:');
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
  console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
}, 100);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Missing Razorpay environment variables");
  console.error("❌ RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
  console.error("❌ RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
  console.error("❌ Please check your .env file and restart the server");
  module.exports = null;
} else if (!process.env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
  console.error("❌ Invalid RAZORPAY_KEY_ID format. Must start with 'rzp_'");
  module.exports = null;
} else {
  console.log("✅ Razorpay environment variables validated");
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    console.log("✅ Razorpay instance created successfully");
    if (razorpay && razorpay.orders) {
      console.log("✅ Razorpay orders API available");
    } else {
      console.error("❌ Razorpay orders API not available");
    }

    module.exports = razorpay;
  } catch (error) {
    console.error("❌ Error creating Razorpay instance:", error.message);
    console.error("❌ Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct");
    module.exports = null;
  }
}