import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const verifyOTP = async (otp) => {
  const response = await api.post('/auth/verify-otp', { otp });
  return response.data;
};

export const resendOTP = async () => {
  const response = await api.post('/auth/resend-otp');
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const completeGoogleSignup = async (userData) => {
  const response = await api.post('/auth/complete-profile', userData);
  return response.data;
};

// Umpire authentication and management
export const umpireLogin = async (email, password) => {
  const response = await api.post('/auth/umpire/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const createUmpire = async (umpireData) => {
  const response = await api.post('/auth/umpire', umpireData);
  return response.data;
};

export const getOrganizerUmpires = async (tournamentId) => {
  const url = tournamentId ? `/auth/umpire?tournamentId=${tournamentId}` : '/auth/umpire';
  const response = await api.get(url);
  return response.data;
};