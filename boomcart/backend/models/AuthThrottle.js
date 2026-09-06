const mongoose = require('mongoose');

const authThrottleSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  action: { type: String, required: true }, // 'send-otp'
  count: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-deletes after 24 hours
});

module.exports = mongoose.model('AuthThrottle', authThrottleSchema);
