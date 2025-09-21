import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Local Backend URL for the demo
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

export const saveArtisanProfile = (profileData) => {
  return apiClient.put('/artisans/profile', profileData);
};

export const updateProduct = (id, productData) => {
  return apiClient.put(`/products/${id}`, productData);
};

export const regenerateContent = (id, regenerationRequest) => {
  return apiClient.post(`/products/${id}/regenerate`, regenerationRequest);
};
export const getShowcase = (artisanId) => {
  return apiClient.get(`/showcase/${artisanId}`);
};