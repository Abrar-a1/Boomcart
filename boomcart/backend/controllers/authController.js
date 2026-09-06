const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Otp = require('../models/Otp');
const AuthThrottle = require('../models/AuthThrottle');
const generateTokens = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const sendOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { type } = req.body;
  if (!email || !type) { res.status(400); throw new Error('Email and type are required'); }
  
  // DB-backed email throttling to prevent IP-rotation spam
  const throttleRecord = await AuthThrottle.findOneAndUpdate(
    { email, action: 'send-otp' },
    { $inc: { count: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (throttleRecord.count > 10) {
    res.status(429); throw new Error('Too many requests for this email. Please try again tomorrow.');
  }

  const userExists = await User.findOne({ email });

  if (type === 'signup' && userExists) {
    res.status(400); throw new Error('Email already registered');
  }
  
  // Account enumeration defense: If reset, we always return success.
  // We'll proceed with generating the OTP but we won't email it if user doesn't exist.
  // But wait, the client is waiting for OTP. So we do need to generate it.
  
  const existingOtp = await Otp.findOne({ email, type });
  if (existingOtp) {
    if (Date.now() - new Date(existingOtp.lastResend).getTime() < 60000) {
      res.status(429); throw new Error('Please wait 60 seconds before requesting another OTP');
    }
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  await Otp.findOneAndUpdate(
    { email, type },
    { email, otp: hashedOtp, type, attempts: 0, lastResend: Date.now(), createdAt: Date.now() },
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
    
    if (type === 'reset') {
       res.status(200).json({ success: true, message: 'If an account with this email exists, an OTP has been sent.' });
    } else {
       res.status(200).json({ success: true, message: 'OTP sent' });
    }
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

  const otpRecord = await Otp.findOne({ email, type });
  
  if (!otpRecord) { res.status(400); throw new Error('Invalid or expired OTP'); }

  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  if (otpRecord.otp !== hashedOtp) {
    // Atomic increment using findOneAndUpdate to prevent race conditions
    const updatedOtp = await Otp.findOneAndUpdate(
      { _id: otpRecord._id },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (updatedOtp && updatedOtp.attempts >= 5) {
      await Otp.findByIdAndDelete(otpRecord._id);
      res.status(400); throw new Error('Maximum attempts reached. Please request a new OTP.');
    }
    res.status(400); throw new Error('Invalid OTP');
  }

  // OTP is correct! Delete it so it cannot be reused.
  await Otp.findByIdAndDelete(otpRecord._id);

  if (type === 'signup') {
    if (!name || !password) { res.status(400); throw new Error('Name and password required for signup'); }
    if (await User.findOne({ email })) { res.status(400); throw new Error('Email already registered'); }

    // Explicitly enforce role as 'user' for public signups to prevent privilege escalation
    const role = 'user';
    
    const user = await User.create({
      name,
      email,
      password,
      role
    });
    
    const { refreshToken } = generateTokens(res, user._id);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokens.push({
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    await user.save({ validateBeforeSave: false });

    return res.status(201).json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, profileCompleted: user.profileCompleted },
    });
  } 
  
  if (type === 'reset') {
    const user = await User.findOne({ email });
    if (!user) { res.status(400); throw new Error('User not found'); }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });

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
  
  const { refreshToken } = generateTokens(res, user._id);
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokens.push({
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  await user.save({ validateBeforeSave: false });
  
  res.json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, profileCompleted: user.profileCompleted },
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
  user.refreshTokens = []; // Revoke sessions on password change
  await user.save();
  res.json({ success: true, message: 'Password updated. Please login again.' });
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
  user.refreshTokens = []; // Revoke all sessions on password reset
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  
  res.json({ success: true, message: 'Password reset successful. Please login.' });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401); throw new Error('Not authorized, no refresh token');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401); throw new Error('Not authorized, user invalid');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const sessionIndex = user.refreshTokens.findIndex(rt => rt.tokenHash === tokenHash);

    if (sessionIndex === -1) {
      // Possible reuse of an already-rotated token! Wipe all sessions to be safe.
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      res.status(401); throw new Error('Token reuse detected. All sessions revoked.');
    }

    // Remove the old token hash
    user.refreshTokens.splice(sessionIndex, 1);

    // Issue new tokens
    const { refreshToken: newRefreshToken } = generateTokens(res, user._id);
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    
    user.refreshTokens.push({
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    
    await user.save({ validateBeforeSave: false });
    
    res.json({ success: true, message: 'Access token refreshed' });
  } catch (error) {
    res.status(401); throw new Error(error.message || 'Not authorized, invalid refresh token');
  }
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        user.refreshTokens = user.refreshTokens.filter(rt => rt.tokenHash !== tokenHash);
        await user.save({ validateBeforeSave: false });
      }
    } catch (e) {
      // Ignore if token is invalid during logout, we just clear cookies
    }
  }

  res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = { sendOtp, verifyOtp, login, getMe, updateProfile, changePassword, resetPassword, refresh, logout };