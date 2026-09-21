import axios from 'axios';

// Ensure baseURL always ends with /api regardless of env var format
const rawUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`) : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withXSRFToken: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => config, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;

    // Handle CSRF token failures – re-fetch token and retry once (fixes mobile cookie issues)
    if (err.response?.status === 403 && !originalConfig._csrfRetry) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('csrf')) {
        originalConfig._csrfRetry = true;
        await api.get('/auth/csrf'); // refresh the XSRF-TOKEN cookie
        return api(originalConfig);  // retry the original request
      }
    }

    // If 401 and it's not the login or refresh route itself, try refreshing
    if (err.response?.status === 401 && !originalConfig.url.includes('/auth/login') && !originalConfig.url.includes('/auth/refresh')) {
      
      if (originalConfig._retry) {
        return Promise.reject(err);
      }
      originalConfig._retry = true;

      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          return api(originalConfig);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      return new Promise(function (resolve, reject) {
        api.post('/auth/refresh')
          .then(({ data }) => {
            processQueue(null, data.accessToken); // Or true
            resolve(api(originalConfig));
          })
          .catch((_error) => {
            processQueue(_error, null);
            // Do not force a hard reload redirect if the failing request was just the startup session check
            if (!originalConfig.url.includes('/auth/me')) {
              window.location.href = '/login';
            }
            reject(_error);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    
    return Promise.reject(err);
  }
);

export const fetchProducts = (filters) => api.get('/products', { params: filters });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const bookAppointment = (data) => api.post('/appointments', data);
export const getMyBookings = () => api.get('/appointments/my-bookings');
export const initCsrf = () => api.get('/auth/csrf');

export default api;