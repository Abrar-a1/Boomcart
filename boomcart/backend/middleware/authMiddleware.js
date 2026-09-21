const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) { res.status(401); throw new Error('User not found'); }
      if (!req.user.isActive) { res.status(401); throw new Error('Account deactivated'); }
      return next();
    } catch {
      res.status(401); throw new Error('Not authorized, invalid token');
    }
  }
  res.status(401); throw new Error('Not authorized, no token');
});

// Flexible role-based authorization: requireRole('admin', 'superadmin')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Authentication required'));
  }
  if (roles.includes(req.user.role)) return next();
  res.status(403);
  return next(new Error('Insufficient permissions'));
};

// Backward-compatible alias: allows both admin and superadmin
const admin = requireRole('admin', 'superadmin');

module.exports = { protect, admin, requireRole };
