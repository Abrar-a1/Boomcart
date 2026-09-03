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
  if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  
  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token and store in database
  user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save({ validateBeforeSave: false });
  
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n========================================`);
    console.log(`🔐 PASSWORD RESET LINK: ${resetUrl}`);
    console.log(`========================================\n`);
  }

  // Send email asynchronously (fire and forget) to prevent slow API response
  sendEmail({
    to: user.email,
    subject: 'Password Reset — Boomcart',
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#fff;border-radius:12px">
      <h2 style="color:#1a1a2e;margin-bottom:8px">Hi ${user.name},</h2>
      <p style="color:#555;font-size:15px;line-height:1.6">We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:28px 0">
        <a href="${resetUrl}" style="background:#1E3A3A;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:16px;display:inline-block">Reset Password</a>
      </div>
      <p style="color:#888;font-size:13px;line-height:1.6">This link is valid for <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="color:#aaa;font-size:12px;text-align:center">© ${new Date().getFullYear()} Boomcart. All rights reserved.</p>
    </div>`,
  }).catch(async (error) => {
    console.error('Email sending failed:', error.message);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
  });

  res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400); throw new Error('Token and new password are required'); }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ 
    resetPasswordToken: hashedToken, 
    resetPasswordExpire: { $gt: Date.now() } 
  }).select('+resetPasswordToken +resetPasswordExpire');
  
  if (!user) { res.status(400); throw new Error('Invalid or expired reset link'); }
  
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful', data: { token: generateToken(user._id) } });
});

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };