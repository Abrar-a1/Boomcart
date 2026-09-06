import axios from 'axios';

// Ensure baseURL always ends with /api regardless of env var format
const rawUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`) : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => config, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;

    // If 401 and it's not the login or refresh route itself, try refreshing
    if (err.response?.status === 401 && !originalConfig.url.includes('/auth/login') && !originalConfig.url.includes('/auth/refresh')) {
      if (!originalConfig._retry) {
        originalConfig._retry = true;
        try {
          await api.post('/auth/refresh');
          return api(originalConfig);
        } catch (_error) {
          // Refresh token expired or invalid
          localStorage.removeItem('boomcart_user');
          window.location.href = '/login';
          return Promise.reject(_error);
        }
      }
    }
    
    return Promise.reject(err);
  }
);

export const fetchProducts = (filters) => api.get('/products', { params: filters });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const bookAppointment = (data) => api.post('/appointments', data);
export const getMyBookings = () => api.get('/appointments/my-bookings');

export default api;