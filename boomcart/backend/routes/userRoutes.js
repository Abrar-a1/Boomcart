const express = require('express');
const r = express.Router();
const { toggleWishlist, getWishlist, addAddress, deleteAddress, getAllUsers, updateUserRole, deactivateUser, getAdmins, addAdmin, removeAdmin } = require('../controllers/userController');
const { protect, admin, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { userSchemas } = require('../validators');
r.post('/wishlist/:productId', protect, toggleWishlist);
r.get('/wishlist', protect, getWishlist);
r.post('/addresses', protect, validate(userSchemas.addAddress), addAddress);
r.delete('/addresses/:addressId', protect, deleteAddress);
r.get('/admin/all', protect, admin, getAllUsers);
r.put('/admin/:id/role', protect, requireRole('superadmin'), updateUserRole);
r.delete('/admin/:id', protect, admin, deactivateUser);

// Admin management (superadmin only)
r.get('/admin/admins', protect, requireRole('superadmin'), getAdmins);
r.post('/admin/admins', protect, requireRole('superadmin'), addAdmin);
r.delete('/admin/admins/:userId', protect, requireRole('superadmin'), removeAdmin);

module.exports = r;
