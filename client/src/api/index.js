import axios from 'axios';

const API = axios.create({
  baseURL: 'https://shopx-29b1.onrender.com/api',
});

// Auto-attach admin token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopx-admin-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Products ──────────────────────────────────────────────────
export const fetchProducts = () => API.get('/products');
export const fetchProduct = (id) => API.get(`/products/${id}`);
export const addProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ── Orders ────────────────────────────────────────────────────
export const fetchOrders = () => API.get('/orders');
export const placeOrder = (data) => API.post('/orders', data);
export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}`, { status });
export const deleteOrder = (id) => API.delete(`/orders/${id}`);

// ── Auth ──────────────────────────────────────────────────────
export const adminLogin = (credentials) => API.post('/auth/login', credentials);

// ── Image URL helper ─────────────────────────────────────────
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://shopx-29b1.onrender.com/images/product_tshirt.jpg';

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  return `https://shopx-29b1.onrender.com/images/${imagePath}`;
};

export default API;