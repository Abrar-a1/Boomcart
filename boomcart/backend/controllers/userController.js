const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// POST /api/users/wishlist/:productId  — FIX: findIndex+toString, indexOf fails on ObjectIds
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.findIndex(id => id.toString() === pid);
  idx === -1 ? user.wishlist.push(pid) : user.wishlist.splice(idx, 1);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

// GET /api/users/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice ratings category subCategory');
  res.json({ success: true, data: user.wishlist });
});

// POST /api/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
});

// DELETE /api/users/addresses/:addressId
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

// GET /api/users/admin/all
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt').select('-password');
  res.json({ success: true, count: users.length, data: users });
});

// PUT /api/users/admin/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

// DELETE /api/users/admin/:id  — soft deactivate only
const deactivateUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400); throw new Error('Cannot deactivate your own account');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: 'User deactivated' });
});

module.exports = { toggleWishlist, getWishlist, addAddress, deleteAddress, getAllUsers, updateUserRole, deactivateUser };
