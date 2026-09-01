const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, required: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const update = stats.length
    ? { ratings: Math.round(stats[0].avg * 10) / 10, numReviews: stats[0].count }
    : { ratings: 0, numReviews: 0 };
  await mongoose.model('Product').findByIdAndUpdate(productId, update);
};

reviewSchema.post('save', function () { this.constructor.calcAverageRatings(this.product); });
reviewSchema.post('findOneAndDelete', function (doc) { if (doc) doc.constructor.calcAverageRatings(doc.product); });

module.exports = mongoose.model('Review', reviewSchema);
