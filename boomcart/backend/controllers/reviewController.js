const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order  = require('../models/Order');

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  if (await Review.findOne({ user: req.user._id, product: productId })) {
    res.status(400); throw new Error('Already reviewed this product');
  }
  const verified = await Order.findOne({ user: req.user._id, 'orderItems.product': productId, isPaid: true });
  const review = await Review.create({ user: req.user._id, product: productId, rating: Number(rating), title, comment, isVerifiedPurchase: !!verified });
  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: review });
});

// GET /api/reviews/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1, limit = 10, skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId }).populate('user', 'name avatar').sort('-createdAt').skip(skip).limit(limit),
    Review.countDocuments({ product: req.params.productId }),
  ]);
  res.json({ success: true, data: reviews, totalReviews: total, currentPage: page, totalPages: Math.ceil(total / limit) });
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { createReview, getProductReviews, deleteReview };
