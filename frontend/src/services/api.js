import axios from 'axios';

// Dynamic API host based on environment variable, local network, or production fallback
const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname;
    const isLocal = /^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(hostname);
    if (isLocal) {
      return `http://${hostname}:5000/api`;
    }
  }
  return 'https://sportstek.onrender.com/api';
};

const API_URL = getDefaultApiUrl();

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { API_URL };
export default api;