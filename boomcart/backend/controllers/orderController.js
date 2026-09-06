const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const productService = require('../services/productService');
const { sendEmail, orderConfirmationEmail } = require('../utils/sendEmail');

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, idempotencyKey } = req.body;
  if (!orderItems?.length) { res.status(400); throw new Error('No order items'); }

  // Check idempotency first (if provided)
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey, user: req.user._id });
    if (existingOrder) {
      return res.status(200).json({ success: true, data: existingOrder, message: 'Order already processed' });
    }
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let calculatedItemsPrice = 0;
    
    // Server-side authoritative pricing & atomic stock decrements
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isActive) {
        throw new Error(`Product not found or inactive: ${item.name || item.product}`);
      }

      // Decrement stock atomically (will throw if insufficient stock)
      await productService.validateAndDecrementStock(item.product, item.size, item.quantity, session);

      // Snapshot authoritative price
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      item.price = price;
      
      // We also trust the server product name and image
      item.name = product.name;
      item.image = product.images[0]?.url || item.image || '';

      calculatedItemsPrice += price * item.quantity;
    }

    const calculatedShippingPrice = calculatedItemsPrice > 999 ? 0 : 99;
    const calculatedTaxPrice = Math.round(calculatedItemsPrice * 0.05);
    const calculatedDiscount = 0; // Explicitly set to 0 as per Phase 1B (no trust in client discount)
    const calculatedTotalPrice = calculatedItemsPrice + calculatedShippingPrice + calculatedTaxPrice - calculatedDiscount;

    const order = await Order.create([{
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      shippingPrice: calculatedShippingPrice,
      taxPrice: calculatedTaxPrice,
      totalPrice: calculatedTotalPrice,
      couponCode: couponCode || '',
      discountAmount: calculatedDiscount,
      orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      expiresAt: paymentMethod === 'razorpay' ? new Date(Date.now() + 15 * 60 * 1000) : undefined,
      idempotencyKey
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Only send confirmation email for COD — Razorpay orders get it after payment verification
    if (paymentMethod === 'cod') {
      try {
        await sendEmail({ to: req.user.email, subject: `Order Confirmed #${order[0]._id.toString().slice(-8).toUpperCase()} | Boomcart`, html: orderConfirmationEmail(order[0], req.user) });
      } catch (e) { console.error('Email failed:', e.message); }
    }
    
    res.status(201).json({ success: true, data: order[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    throw new Error(error.message || 'Order creation failed');
  }
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

// DELETE /api/orders/admin/cleanup — Cleanup stale unpaid Razorpay orders older than 15 min (manual route fallback)
const cleanupUnpaidOrders = asyncHandler(async (req, res) => {
  const staleOrders = await Order.find({
    isPaid: false,
    orderStatus: 'pending',
    expiresAt: { $lt: new Date() },
  });
  let cleaned = 0;
  for (const order of staleOrders) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Find and lock the order to prevent concurrent processing
      const lockedOrder = await Order.findOneAndUpdate(
        { _id: order._id, orderStatus: 'pending', isPaid: false, expiresAt: { $lt: new Date() } },
        { $set: { orderStatus: 'cancelled' }, $unset: { expiresAt: 1 } },
        { session, new: true }
      );
      if (lockedOrder) {
        for (const item of lockedOrder.orderItems) {
          await productService.restoreStock(item.product, item.size, item.quantity, session);
        }
        await session.commitTransaction();
        cleaned++;
      } else {
        await session.abortTransaction();
      }
    } catch (err) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
  res.json({ success: true, message: `Cleaned ${cleaned} stale unpaid orders` });
});

module.exports = { createOrder, getMyOrders, getDashboardStats, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, cleanupUnpaidOrders };
