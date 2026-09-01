import axios from 'axios';

// Ensure baseURL always ends with /api regardless of env var format
const rawUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`) : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('boomcart_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('boomcart_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const fetchProducts = (filters) => api.get('/products', { params: filters });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const bookAppointment = (data) => api.post('/appointments', data);
export const getMyBookings = () => api.get('/appointments/my-bookings');

export default api;