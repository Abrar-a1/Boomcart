import api from './api';
export const createOrder       = (data)   => api.post('/orders', data);
export const getMyOrders       = (page=1) => api.get('/orders/my-orders', { params: { page } });
export const getOrderById      = (id)     => api.get(`/orders/${id}`);
export const getAllOrders       = (params) => api.get('/orders/admin/all', { params });
export const getDashboardStats = ()       => api.get('/orders/admin/stats');
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);

export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);
