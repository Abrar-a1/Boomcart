const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const sendOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { type } = req.body;
  if (!email || !type) { res.status(400); throw new Error('Email and type are required'); }
  
  const userExists = await User.findOne({ email });

  if (type === 'signup' && userExists) {
    res.status(400); throw new Error('Email already registered');
  }
  if (type === 'reset' && !userExists) {
    res.status(404); throw new Error('No account found with that email');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  await Otp.findOneAndUpdate(
    { email },
    { email, otp: hashedOtp, type, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  if (process.env.NODE_ENV === 'development') {
    console.log(`\n========================================`);
    console.log(`🔐 OTP [${type}]: ${otp}`);
    console.log(`========================================\n`);
  }

  try {
    await sendEmail({
      to: email,
      subject: type === 'signup' ? 'Verify your Boomcart Account' : 'Password Reset OTP — Boomcart',
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#fff;border-radius:12px">
        <h2 style="color:#1a1a2e;margin-bottom:8px">${type === 'signup' ? 'Welcome to Boomcart!' : 'Reset your password'}</h2>
        <p style="color:#555;font-size:15px;line-height:1.6">Please use the OTP below to proceed:</p>
        <div style="text-align:center;margin:28px 0">
          <div style="background:#1E3A3A;color:#fff;padding:14px 36px;border-radius:8px;font-weight:700;font-size:24px;letter-spacing:4px;display:inline-block">${otp}</div>
        </div>
        <p style="color:#888;font-size:13px;line-height:1.6">This OTP is valid for <strong>10 minutes</strong>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px;text-align:center">© ${new Date().getFullYear()} Boomcart. All rights reserved.</p>
      </div>`,
    });
    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('Email sending failed:', error.message);
    await Otp.findOneAndDelete({ email });
    res.status(500);
    throw new Error('Failed to send email. Please check email configuration.');
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { otp, type, name, password } = req.body;
  if (!email || !otp || !type) { res.status(400); throw new Error('Email, OTP, and type are required'); }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const otpRecord = await Otp.findOne({ email, otp: hashedOtp, type });
  
  if (!otpRecord) { res.status(400); throw new Error('Invalid or expired OTP'); }

  if (type === 'signup') {
    if (!name || !password) { res.status(400); throw new Error('Name and password required for signup'); }
    if (await User.findOne({ email })) { res.status(400); throw new Error('Email already registered'); }

    const adminEmailsStr = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
    const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase()).filter(e => e);
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
    
    const user = await User.create({ name, email, password, role, profileCompleted: false });
    await Otp.findOneAndDelete({ email });

    return res.status(201).json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, token: generateToken(user._id) },
    });
  } 
  
  if (type === 'reset') {
    const user = await User.findOne({ email });
    if (!user) { res.status(400); throw new Error('User not found'); }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });
    await Otp.findOneAndDelete({ email });

    return res.status(200).json({
      success: true,
      resetToken
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.trim().toLowerCase();
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

const resetPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { resetToken, newPassword } = req.body;
  
  if (!email || !resetToken || !newPassword) { res.status(400); throw new Error('Email, reset token, and new password are required'); }

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({ 
    email,
    resetPasswordToken: hashedToken, 
    resetPasswordExpire: { $gt: Date.now() } 
  }).select('+resetPasswordToken +resetPasswordExpire');
  
  if (!user) { res.status(400); throw new Error('Invalid or expired reset token'); }
  
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  
  res.json({ success: true, message: 'Password reset successful. Please login.' });
});

module.exports = { sendOtp, verifyOtp, login, getMe, updateProfile, changePassword, resetPassword };