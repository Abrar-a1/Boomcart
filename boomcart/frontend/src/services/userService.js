import api from './api';
// FIX: toggleWishlist must be imported from THIS file (userService), not orderService
export const toggleWishlist  = (productId) => api.post(`/users/wishlist/${productId}`);
export const getWishlist     = ()           => api.get('/users/wishlist');
export const addAddress      = (data)       => api.post('/users/addresses', data);
export const deleteAddress   = (id)         => api.delete(`/users/addresses/${id}`);
export const getAllUsers      = ()           => api.get('/users/admin/all');
export const updateUserRole  = (id, role)   => api.put(`/users/admin/${id}/role`, { role });
export const deactivateUser  = (id)         => api.delete(`/users/admin/${id}`);
