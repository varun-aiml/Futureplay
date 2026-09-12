import axios from 'axios';

// Dynamic API host based on environment variable or current browser hostname (enables mobile testing)
const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname
    ? `http://${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api'
);


const franchiseApi = axios.create({
  baseURL: API_URL
});

franchiseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('franchiseToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default franchiseApi;