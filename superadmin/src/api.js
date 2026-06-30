import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: `${API_URL}/api/superadmin` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('superadmin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('superadmin_token');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;
