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

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const newAddr = req.body;
  
  const existingIdx = user.addresses.findIndex(a => 
    a.fullName === newAddr.fullName &&
    a.addressLine1 === newAddr.addressLine1 &&
    (a.addressLine2 || '') === (newAddr.addressLine2 || '') &&
    a.city === newAddr.city &&
    a.state === newAddr.state &&
    a.pincode === newAddr.pincode &&
    a.phone === newAddr.phone
  );

  if (newAddr.isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }

  if (existingIdx !== -1) {
    if (newAddr.isDefault) {
      user.addresses[existingIdx].isDefault = true;
    }
  } else {
    user.addresses.push(newAddr);
  }
  
  if (!user.profileCompleted) {
    user.profileCompleted = true;
  }
  
  await user.save();
  res.status(201).json({ success: true, data: user.addresses, profileCompleted: user.profileCompleted });
});

// DELETE /api/users/addresses/:addressId
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

// GET /api/users/admin/all — list all users (admin + superadmin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt').select('-password');
  res.json({ success: true, count: users.length, data: users });
});

// PUT /api/users/admin/:id/role — superadmin only, with protections
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  // Prevent creating superadmins through this endpoint
  if (role === 'superadmin') {
    res.status(403); throw new Error('Cannot assign superadmin role through this endpoint');
  }

  // Only allow valid roles
  if (!['customer', 'admin'].includes(role)) {
    res.status(400); throw new Error('Invalid role. Must be "customer" or "admin"');
  }

  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  // Prevent modifying a superadmin's role
  if (user.role === 'superadmin') {
    res.status(403); throw new Error('Cannot modify a Super Admin\'s role');
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
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

// ─── ADMIN MANAGEMENT (superadmin only) ──────────────────────

// GET /api/users/admin/admins — list all admin + superadmin users
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
    .select('name email role createdAt')
    .sort('-createdAt');
  res.json({ success: true, data: admins });
});

// POST /api/users/admin/admins — promote customer → admin (superadmin only)
const addAdmin = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const user = await User.findOne({ email });
  if (!user) { res.status(404); throw new Error('No registered user found with this email'); }

  if (user.role === 'superadmin') {
    res.status(409); throw new Error(`${user.name} is a Super Admin and cannot be modified`);
  }
  if (user.role === 'admin') {
    res.status(409); throw new Error(`${user.name} is already an administrator`);
  }

  user.role = 'admin';
  await user.save({ validateBeforeSave: false });
  res.json({
    success: true,
    message: `${user.name} has been added as an administrator`,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// DELETE /api/users/admin/admins/:userId — demote admin → customer (superadmin only)
const removeAdmin = asyncHandler(async (req, res) => {
  // Prevent self-removal
  if (req.params.userId === req.user._id.toString()) {
    res.status(400); throw new Error('You cannot remove your own admin access');
  }

  const user = await User.findById(req.params.userId);
  if (!user) { res.status(404); throw new Error('User not found'); }

  // Prevent demoting a superadmin
  if (user.role === 'superadmin') {
    res.status(403); throw new Error('Cannot demote a Super Admin');
  }

  if (user.role !== 'admin') {
    res.status(400); throw new Error('This user is not an administrator');
  }

  user.role = 'customer';
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: `${user.name} has been removed as administrator` });
});

module.exports = {
  toggleWishlist, getWishlist, addAddress, deleteAddress,
  getAllUsers, updateUserRole, deactivateUser,
  getAdmins, addAdmin, removeAdmin,
};
