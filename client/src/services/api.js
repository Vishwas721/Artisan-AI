import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend server URL
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const createProduct = (formData) => {
  return apiClient.post('/products', formData);
};
export const getProductById = (id) => {
  // apiClient is already configured with the base URL
  return apiClient.get(`/products/${id}`);
};