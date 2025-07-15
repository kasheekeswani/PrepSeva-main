const Razorpay = require('razorpay');

// ✅ Add a small delay to ensure env vars are loaded
setTimeout(() => {
  console.log('🔍 Razorpay config - checking environment variables:');
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
  console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
}, 100);

// ✅ Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Missing Razorpay environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)");
  console.error("❌ Current RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
  console.error("❌ Current RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
  console.error("❌ Please check your .env file and restart the server");
  module.exports = null;
} else {
  console.log("✅ Razorpay environment variables found");
  console.log("✅ RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
 
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
   
    console.log("✅ Razorpay instance created successfully");
    
    // ✅ Test the instance creation
    if (razorpay && razorpay.orders) {
      console.log("✅ Razorpay orders API available");
    } else {
      console.error("❌ Razorpay orders API not available");
    }
    
    module.exports = razorpay;
  } catch (error) {
    console.error("❌ Error creating Razorpay instance:", error);
    module.exports = null;
  }
}

