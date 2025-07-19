import api from './api';

export const registerFranchise = async (franchiseData) => {
  const formData = new FormData();
  
  // Append all form fields
  Object.keys(franchiseData).forEach(key => {
    if (key !== 'logo') {
      formData.append(key, franchiseData[key]);
    }
  });
  
  // Append logo if exists
  if (franchiseData.logo) {
    formData.append('logo', franchiseData.logo);
  }
  
  const response = await api.post('/franchise/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  if (response.data.token) {
    localStorage.setItem('franchiseToken', response.data.token);
    localStorage.setItem('franchise', JSON.stringify(response.data.franchise));
  }
  return response.data;
};

export const updateFranchiseLogo = async (franchiseId, logoFile) => {
  const formData = new FormData();
  formData.append('logo', logoFile);
  
  const response = await api.put(`/franchise/${franchiseId}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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