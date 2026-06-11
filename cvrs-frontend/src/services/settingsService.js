import api from './api';

export const getUserSettings = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/settings`);
    return response;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const saveUserSettings = async (userId, settingsData) => {
  try {
    const response = await api.post(`/users/${userId}/settings`, settingsData);
    return response;
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};