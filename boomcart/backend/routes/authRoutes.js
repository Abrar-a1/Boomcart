// authRoutes.js
const express = require('express');
const r = express.Router();
const { sendOtp, verifyOtp, login, getMe, updateProfile, changePassword, resetPassword, refresh, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { authSchemas } = require('../validators');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 OTP requests per windowMs
  message: { success: false, message: 'Too many OTP requests from this IP, please try again after 15 minutes' }
});

r.post('/send-otp', otpLimiter, validate(authSchemas.sendOtp), sendOtp);
r.post('/verify-otp', validate(authSchemas.verifyOtp), verifyOtp);
r.post('/reset-password', validate(authSchemas.resetPassword), resetPassword);
r.post('/login', validate(authSchemas.login), login);
r.get('/me', protect, getMe);
r.put('/update-profile', protect, validate(authSchemas.updateProfile), updateProfile);
r.put('/change-password', protect, validate(authSchemas.changePassword), changePassword);
r.post('/refresh', refresh);
r.post('/logout', logout);

module.exports = r;
