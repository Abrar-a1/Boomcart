// authRoutes.js
const express = require('express');
const r = express.Router();
const { sendOtp, verifyOtp, login, getMe, updateProfile, changePassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { authSchemas } = require('../validators');

r.post('/send-otp', validate(authSchemas.sendOtp), sendOtp);
r.post('/verify-otp', validate(authSchemas.verifyOtp), verifyOtp);
r.post('/reset-password', validate(authSchemas.resetPassword), resetPassword);
r.post('/login', validate(authSchemas.login), login);
r.get('/me', protect, getMe);
r.put('/update-profile', protect, validate(authSchemas.updateProfile), updateProfile);
r.put('/change-password', protect, validate(authSchemas.changePassword), changePassword);

module.exports = r;
