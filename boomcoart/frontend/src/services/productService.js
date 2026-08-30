import api from './api';

class ProductService {
  /**
   * Fetches products based on dynamic filters
   * @param {Object} filters - Search parameters (category, minPrice, sizes, etc)
   * @returns {Promise} Axios response
   */
  getProducts(filters = {}) {
    return api.get('/products', { params: filters });
  }

  /**
   * Fetches a single product by ID
   * @param {string} id 
   * @returns {Promise} Axios response
   */
  getProductById(id) {
    return api.get(`/products/${id}`);
  }
}

export default new ProductService();

// --- ADMIN PRESERVED EXPORTS ---
export const getAdminProducts = () => api.get('/products/admin/all');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleProductStatus = (id) => api.patch(`/products/${id}/toggle`);
