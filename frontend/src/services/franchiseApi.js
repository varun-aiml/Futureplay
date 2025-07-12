import axios from 'axios';

const API_URL = 'https://sportstek.onrender.com/api';

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