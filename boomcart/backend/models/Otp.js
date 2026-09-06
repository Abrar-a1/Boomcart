const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['signup', 'reset'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-deletes after 10 mins
});

module.exports = mongoose.model('Otp', otpSchema);
