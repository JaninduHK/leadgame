import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://leadgame.vercel.app/api',
  timeout: 15000,
});

// Attach JWT token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so error.response.data.error is always a string
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    if (error.response?.data?.error !== undefined &&
        typeof error.response.data.error !== 'string') {
      error.response.data.error = 'An unexpected error occurred.';
    }
    return Promise.reject(error);
  }
);

export default api;
