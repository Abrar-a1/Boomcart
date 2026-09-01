import api from './api';
export const getProductReviews = (productId, params) => api.get(`/reviews/${productId}`, { params });
export const createReview      = (data)   => api.post('/reviews', data);
export const deleteReview      = (id)     => api.delete(`/reviews/${id}`);
