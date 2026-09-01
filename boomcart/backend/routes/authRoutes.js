// authRoutes.js
const express = require('express');
const r = express.Router();
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { authSchemas } = require('../validators');

r.post('/register', validate(authSchemas.register), register);
r.post('/login', validate(authSchemas.login), login);
r.get('/me', protect, getMe);
r.put('/update-profile', protect, validate(authSchemas.updateProfile), updateProfile);
r.put('/change-password', protect, validate(authSchemas.changePassword), changePassword);
r.post('/forgot-password', validate(authSchemas.forgotPassword), forgotPassword);
r.put('/reset-password/:token', validate(authSchemas.resetPassword), resetPassword);
module.exports = r;
