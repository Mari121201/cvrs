import api from './api';

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const changePassword = async (id, passwordData) => {
  try {
    const response = await api.put(`/users/${id}/change-password`, passwordData);
    return response;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};