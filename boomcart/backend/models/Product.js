const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  price:        { type: Number, required: true, min: 0 },
  discountPrice:{ type: Number, default: 0, min: 0 },
  category: {
    type: String, required: true,
    enum: ['kids', 'bridal', 'men', 'women', 'unisex'],
  },
  subCategory: {
    type: String, required: true,
  },
  images: [{ url: { type: String, required: true }, publicId: { type: String, required: true } }],
  video:  { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  sizes: [
    {
      size: { type: String, required: true },
      stock: { type: Number, required: true, min: 0, default: 0 }
    }
  ],
  colors: [{ type: String }],
  stock:      { type: Number, required: true, min: 0, default: 0 },
  
  // --- Kids-specific fields ---
  ageGroup: { type: String, enum: ['0-2', '3-5', '6-10', '11+'] },
  fabricType: { type: String },

  // --- Bridal-specific fields ---
  isCustomizable: { type: Boolean, default: false },
  hasTrial: { type: Boolean, default: false },
  priceRange: { type: String },

  ratings:    { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  tags:       [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
