import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // Use IP to avoid network issues
});

export const createProduct = (formData) => {
  return apiClient.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getProductById = (id) => {
  return apiClient.get(`/products/${id}`);
};

export const generateSocialPlan = (id) => {
  return apiClient.post(`/products/${id}/social-plan`);
};

export const verifyCertificate = (certId) => {
  return apiClient.get(`/verify/${certId}`);
};