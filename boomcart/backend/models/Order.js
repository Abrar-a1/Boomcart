const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    image:    { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size:     String,
    color:    String,
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['razorpay','cod'], required: true },
  paymentResult: {
    razorpayOrderId: String, razorpayPaymentId: String,
    razorpaySignature: String, status: String, paidAt: Date,
  },
  isPaid:        { type: Boolean, default: false },
  itemsPrice:    { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  taxPrice:      { type: Number, required: true, default: 0 },
  totalPrice:    { type: Number, required: true, default: 0 },
  orderStatus: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'],
    default: 'pending',
  },
  statusHistory: [{
    status: String, timestamp: { type: Date, default: Date.now }, message: String,
  }],
  trackingNumber: { type: String, default: '' },
  deliveredAt: Date,
  couponCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({ status: this.orderStatus, timestamp: new Date(), message: `Order ${this.orderStatus}` });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
