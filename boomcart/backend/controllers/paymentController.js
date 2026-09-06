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
  const { currency = 'INR', orderId } = req.body;
  if (!razorpay) { res.status(503); throw new Error('Payment gateway not configured'); }
  if (!orderId) { res.status(400); throw new Error('Order ID required'); }
  
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (order.isPaid) { res.status(400); throw new Error('Order already paid'); }

  const amount = order.totalPrice;
  if (!amount || amount <= 0) { res.status(400); throw new Error('Invalid order amount'); }

  const receiptStr = `rcpt_${orderId}`.slice(0, 40);
  const rpOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), currency,
    receipt: receiptStr,
    notes: { orderId: orderId, userId: req.user._id.toString() },
  });

  // Tightly couple Razorpay order ID to our DB order immediately
  order.paymentResult = { razorpayOrderId: rpOrder.id };
  await order.save({ validateBeforeSave: false });

  res.json({ success: true, data: { id: rpOrder.id, currency: rpOrder.currency, amount: rpOrder.amount } });
});

// POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  
  // Idempotency check
  if (order.isPaid) {
    return res.json({ success: true, message: 'Payment already verified', data: order });
  }

  // Ensure the Razorpay order ID paid matches the one we generated for this specific DB order
  if (!order.paymentResult || order.paymentResult.razorpayOrderId !== razorpay_order_id) {
    res.status(400); throw new Error('Order ID mismatch. Payment verification failed.');
  }

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) { res.status(400); throw new Error('Payment verification signature failed'); }
  
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
  
  // Send confirmation email
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
    const paymentEntity = payloadObj.payload?.payment?.entity;
    if (paymentEntity) {
      console.log(`✅ Webhook: payment captured ${paymentEntity.id}`);
      const orderId = paymentEntity.notes?.orderId || (paymentEntity.description && paymentEntity.description.replace('rcpt_', ''));
      
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          // Verify amount exactly matches what is expected
          const expectedAmount = Math.round(order.totalPrice * 100);
          if (paymentEntity.amount === expectedAmount) {
            order.isPaid = true;
            order.orderStatus = 'confirmed';
            order.paymentResult = {
              razorpayOrderId: paymentEntity.order_id,
              razorpayPaymentId: paymentEntity.id,
              status: 'paid',
              paidAt: new Date(paymentEntity.created_at * 1000 || Date.now()),
            };
            await order.save();

            // Send confirmation email (idempotently wrapped)
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
          } else {
            console.error(`❌ Webhook Amount Mismatch for Order ${orderId}. Expected ${expectedAmount}, got ${paymentEntity.amount}`);
          }
        }
      }
    }
  } else if (payloadObj.event === 'payment.failed') {
    const paymentEntity = payloadObj.payload?.payment?.entity;
    if (paymentEntity) {
      console.log(`❌ Webhook: payment failed ${paymentEntity.id} - ${paymentEntity.error_description}`);
      // Status remains pending or handle specific failure logic here
    }
  }
  res.json({ received: true });
});

module.exports = { createRazorpayOrder, verifyPayment, handleWebhook };
