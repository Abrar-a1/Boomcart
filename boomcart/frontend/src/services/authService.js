import api from './api';
export const sendOtp       = (data) => api.post('/auth/send-otp', data);
export const verifyOtp     = (data) => api.post('/auth/verify-otp', data);
export const loginUser     = (data) => api.post('/auth/login', data);
export const logoutUser    = ()     => api.post('/auth/logout');
export const getMe         = ()     => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/update-profile', data);
export const changePassword= (data) => api.put('/auth/change-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
