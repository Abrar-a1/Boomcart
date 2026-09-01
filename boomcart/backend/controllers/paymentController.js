const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');
const User     = require('../models/User');
const { sendEmail, orderConfirmationEmail } = require('../utils/sendEmail');

let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  }
} catch (error) {
  console.warn('⚠️ Razorpay initialization failed: Check your API keys');
}

// POST /api/payments/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderId } = req.body;
  if (!razorpay) { res.status(503); throw new Error('Payment gateway not configured'); }
  if (!amount || amount <= 0) { res.status(400); throw new Error('Invalid amount'); }
  const receiptStr = `rcpt_${orderId || Date.now()}`.slice(0, 40);
  const rpOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), currency,
    receipt: receiptStr,
    notes: { orderId: orderId || '', userId: req.user?._id?.toString() || 'guest' },
  });
  res.json({ success: true, data: { id: rpOrder.id, currency: rpOrder.currency, amount: rpOrder.amount } });
});

// POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) { res.status(400); throw new Error('Payment verification failed'); }
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.isPaid) {
    return res.json({ success: true, message: 'Payment already verified', data: order });
  }
  order.isPaid = true;
  order.orderStatus = 'confirmed';
  order.paymentResult = {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    status: 'paid',
    paidAt: new Date(),
  };
  await order.save();
  // Send confirmation email now that payment is confirmed
  try {
    const user = await User.findById(order.user);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} | Boomcart`,
        html: orderConfirmationEmail(order, user),
      });
    }
  } catch (e) { console.error('Confirmation email failed:', e.message); }
  res.json({ success: true, message: 'Payment verified', data: order });
});

// POST /api/payments/webhook  (public)
const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  // Reject if webhook secret is not configured or signature is missing
  if (!secret || !sig) {
    return res.status(400).json({ message: 'Webhook not configured or signature missing' });
  }
  // express.raw() parses the payload as a Buffer. Convert it to string so hashing matches Razorpay payload EXACTLY.
  const body = Buffer.isBuffer(req.body) 
    ? req.body.toString('utf8') 
    : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (expected !== sig) return res.status(400).json({ message: 'Invalid signature' });
  
  let payloadObj;
  try {
    payloadObj = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  if (payloadObj.event === 'payment.captured') {
    console.log(`✅ Webhook: payment captured ${payloadObj.payload?.payment?.entity?.id}`);
  }
  res.json({ received: true });
});

module.exports = { createRazorpayOrder, verifyPayment, handleWebhook };
