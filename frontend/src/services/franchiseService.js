import api from './api';

export const registerFranchise = async (franchiseData) => {
  const response = await api.post('/franchise/register', franchiseData);
  if (response.data.token) {
    localStorage.setItem('franchiseToken', response.data.token);
    localStorage.setItem('franchise', JSON.stringify(response.data.franchise));
  }
  return response.data;
};

export const loginFranchise = async (username, password) => {
  const response = await api.post('/franchise/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('franchiseToken', response.data.token);
    localStorage.setItem('franchise', JSON.stringify(response.data.franchise));
  }
  return response.data;
};

export const logoutFranchise = () => {
  localStorage.removeItem('franchiseToken');
  localStorage.removeItem('franchise');
};

export const getCurrentFranchise = () => {
  const franchise = localStorage.getItem('franchise');
  return franchise ? JSON.parse(franchise) : null;
};

export const getAllFranchises = async () => {
  const response = await api.get('/franchise');
  return response.data;
};