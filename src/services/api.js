import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 8000,
});

export const getCakes = () => api.get('/cakes').then(({ data }) => data);
export const getCake = (id) => api.get(`/cakes/${id}`).then(({ data }) => data);
export const getUsersByEmail = (email) =>
  api.get('/users', { params: { email } }).then(({ data }) => data);
export const createUser = (user) => api.post('/users', user).then(({ data }) => data);
export const createOrder = (order) => api.post('/orders', order).then(({ data }) => data);
export const getOrders = () => api.get('/orders').then(({ data }) => data);
export const getOrdersByCustomer = (customerId) =>
  api.get('/orders', { params: { customerId } }).then(({ data }) => data);
export const updateOrder = (id, changes) =>
  api.put(`/orders/${id}`, changes).then(({ data }) => data);
export const createCustomOrder = (order) =>
  api.post('/customOrders', order).then(({ data }) => data);
export const getCustomOrders = () =>
  api.get('/customOrders').then(({ data }) => data);
export const getCustomOrdersByCustomer = (customerId) =>
  api.get('/customOrders', { params: { customerId } }).then(({ data }) => data);
export const updateCustomOrder = (id, changes) =>
  api.put(`/customOrders/${id}`, changes).then(({ data }) => data);
export const deleteCustomOrder = (id) => api.delete(`/customOrders/${id}`);
export const deleteCake = (id) => api.delete(`/cakes/${id}`);
export const createCake = (cake) => api.post('/cakes', cake).then(({ data }) => data);
export const updateCake = (id, changes) =>
  api.put(`/cakes/${id}`, changes).then(({ data }) => data);

export function apiErrorMessage(error) {
  if (error.code === 'ERR_NETWORK') {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    return `Không kết nối được máy chủ (${apiUrl}). Hãy chạy npm start để khởi động giao diện và API.`;
  }
  if (error.code === 'ECONNABORTED') {
    return 'Máy chủ phản hồi quá chậm. Vui lòng thử lại.';
  }
  return error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi kết nối máy chủ.';
}
