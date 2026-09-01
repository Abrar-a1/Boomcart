const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
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

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403);
  return next(new Error('Admin access required'));
};

module.exports = { protect, admin };
