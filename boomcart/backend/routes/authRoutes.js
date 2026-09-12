// authRoutes.js
const express = require('express');
const r = express.Router();
const { sendOtp, verifyOtp, login, getMe, updateProfile, changePassword, resetPassword, refresh, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, loginLimiter, otpVerifyLimiter } = require('../middleware/rateLimitMiddleware');
const validate = require('../middleware/validate');
const { authSchemas } = require('../validators');


r.get('/csrf', (req, res) => res.status(200).json({ success: true }));
r.post('/send-otp', authLimiter, validate(authSchemas.sendOtp), sendOtp);
r.post('/verify-otp', otpVerifyLimiter, validate(authSchemas.verifyOtp), verifyOtp);
r.post('/reset-password', validate(authSchemas.resetPassword), resetPassword);
r.post('/login', loginLimiter, validate(authSchemas.login), login);
r.get('/me', protect, getMe);
r.put('/update-profile', protect, validate(authSchemas.updateProfile), updateProfile);
r.put('/change-password', protect, validate(authSchemas.changePassword), changePassword);
r.post('/refresh', refresh);
r.post('/logout', logout);

module.exports = r;
