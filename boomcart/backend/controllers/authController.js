const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error('All fields required'); }
  if (await User.findOne({ email })) { res.status(400); throw new Error('Email already registered'); }
  
  // Admin emails can be defined in .env as a comma-separated list (e.g., ADMIN_EMAILS=admin1@domain.com,admin2@domain.com)
  const adminEmailsStr = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase()).filter(e => e);
  const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
  
  const user = await User.create({ name, email, password, role });
  res.status(201).json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, token: generateToken(user._id) },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Email and password required'); }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) { res.status(401); throw new Error('Invalid credentials'); }
  if (!user.isActive) { res.status(401); throw new Error('Account deactivated'); }
  res.json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, token: generateToken(user._id) },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice');
  res.json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name && req.body.name.trim())  updates.name = req.body.name.trim();
  if (req.body.email && req.body.email.trim()) updates.email = req.body.email.trim().toLowerCase();
  if (Object.keys(updates).length === 0) { res.status(400); throw new Error('Nothing to update'); }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) { res.status(400); throw new Error('Both passwords required'); }
  if (newPassword.length < 6) { res.status(400); throw new Error('New password must be at least 6 characters'); }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) { res.status(400); throw new Error('Current password incorrect'); }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated', data: { token: generateToken(user._id) } });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');
  if (!user) return res.json({ success: true, message: 'If that email exists, an OTP was sent.' });
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash OTP and set expire
  user.resetPasswordToken  = crypto.createHash('sha256').update(otp).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save({ validateBeforeSave: false });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n========================================`);
    console.log(`🔐 PASSWORD RESET OTP: ${otp}`);
    console.log(`========================================\n`);
  }

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP — Boomcart',
      html: `<p>Hi ${user.name},</p><p>Your password reset OTP is:</p><h2 style="color:#1a1a2e;font-size:32px;letter-spacing:4px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px;width:fit-content">${otp}</h2><p>This OTP is valid for 15 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
    });
  } catch (error) {
    console.error('Email sending failed:', error.message);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
  }
  res.json({ success: true, message: 'If that email exists, an OTP was sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) { res.status(400); throw new Error('Email, OTP, and new password are required'); }

  const hashedOTP = crypto.createHash('sha256').update(otp.toString()).digest('hex');
  const user = await User.findOne({ 
    email,
    resetPasswordToken: hashedOTP, 
    resetPasswordExpire: { $gt: Date.now() } 
  }).select('+resetPasswordToken +resetPasswordExpire');
  
  if (!user) { res.status(400); throw new Error('Invalid or expired OTP'); }
  
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful', data: { token: generateToken(user._id) } });
});

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };