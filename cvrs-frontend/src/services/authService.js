import api from './api';

export const login = (email, password) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);
  
  return api.post('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const register = (userData) => {
  // Make sure all fields are sent correctly
  const requestData = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || 'PARENT',
    phone: userData.phone || '',
    address: userData.address || ''
  };
  
  console.log('Sending registration data:', requestData); // For debugging
  
  return api.post('/register', requestData);
};

export const getCurrentUser = () => {
  return api.get('/dashboard');
};