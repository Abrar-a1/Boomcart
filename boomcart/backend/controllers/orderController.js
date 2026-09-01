const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const productService = require('../services/productService');
const { sendEmail, orderConfirmationEmail } = require('../utils/sendEmail');

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, couponCode, discountAmount } = req.body;
  if (!orderItems?.length) { res.status(400); throw new Error('No order items'); }
  
  // Delegate atomic stock checking to the strict service layer
  for (const item of orderItems) {
    await productService.validateAndDecrementStock(item.product, item.size, item.quantity);
  }

  const order = await Order.create({
    user: req.user._id, orderItems, shippingAddress, paymentMethod,
    itemsPrice, shippingPrice, taxPrice, totalPrice,
    couponCode: couponCode || '', discountAmount: discountAmount || 0,
    orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending',
  });
  // Only send confirmation email for COD — Razorpay orders get it after payment verification
  if (paymentMethod === 'cod') {
    try {
      await sendEmail({ to: req.user.email, subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} | Boomcart`, html: orderConfirmationEmail(order, req.user) });
    } catch (e) { console.error('Email failed:', e.message); }
  }
  res.status(201).json({ success: true, data: order });
});

// GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1, limit = 10, skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort('-createdAt').skip(skip).limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ success: true, data: orders, totalOrders: total, currentPage: page, totalPages: Math.ceil(total / limit) });
});

// GET /api/orders/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, paidOrders, pendingOrders, revenueData, recentOrders, totalProducts, totalUsers] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ isPaid: true }),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Product.countDocuments({ isActive: true }),
    User.countDocuments(),
  ]);
  res.json({ success: true, data: { totalOrders, paidOrders, pendingOrders, totalRevenue: revenueData[0]?.total || 0, recentOrders, totalProducts, totalUsers } });
});

// GET /api/orders/admin/all
const getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1, limit = 20, skip = (page - 1) * limit;
  const filter = req.query.status ? { orderStatus: req.query.status } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort('-createdAt').skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: orders, totalOrders: total, currentPage: page, totalPages: Math.ceil(total / limit) });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  res.json({ success: true, data: order });
});

// PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') order.deliveredAt = new Date();
  await order.save();
  res.json({ success: true, data: order });
});


// PUT /api/orders/:id/cancel  — User can cancel their own pending/confirmed order
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized to cancel this order');
  }
  const cancellable = ['pending', 'confirmed'];
  if (!cancellable.includes(order.orderStatus)) {
    res.status(400); throw new Error(`Cannot cancel an order that is already ${order.orderStatus}`);
  }
  // Restore stock intelligently via Service Layer
  for (const item of order.orderItems) {
    await productService.restoreStock(item.product, item.size, item.quantity);
  }
  order.orderStatus = 'cancelled';
  await order.save();
  res.json({ success: true, message: 'Order cancelled', data: order });
});

// POST /api/payments/verify — also send confirmation email after Razorpay payment succeeds
// (called from paymentController after verifyPayment — import sendEmail there directly)

// DELETE /api/orders/admin/cleanup — Cleanup stale unpaid Razorpay orders older than 30 min
const cleanupUnpaidOrders = asyncHandler(async (req, res) => {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const staleOrders = await Order.find({
    isPaid: false,
    paymentMethod: 'razorpay',
    orderStatus: 'pending',
    createdAt: { $lt: thirtyMinsAgo },
  });
  let cleaned = 0;
  for (const order of staleOrders) {
    // Restore stock
    for (const item of order.orderItems) {
      await productService.restoreStock(item.product, item.size, item.quantity);
    }
    order.orderStatus = 'cancelled';
    await order.save();
    cleaned++;
  }
  res.json({ success: true, message: `Cleaned ${cleaned} stale unpaid orders` });
});

module.exports = { createOrder, getMyOrders, getDashboardStats, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, cleanupUnpaidOrders };
