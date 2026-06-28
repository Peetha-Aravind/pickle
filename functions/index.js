const functions = require('firebase-functions');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_T76UNYD4YwncE5',       // test key
  key_secret: 'YYQ5UwY1YGOTS8wLMfjwLQOS'  // test secret
});

// Set CORS headers manually
const setCorsHeaders = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true; // Preflight handled
  }
  return false;
};

exports.createRazorpayOrder = functions.https.onRequest(async (req, res) => {
  if (setCorsHeaders(req, res)) return; // Stop if OPTIONS

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // rupees → paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});
