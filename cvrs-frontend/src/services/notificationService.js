import api from './api';

export const getNotifications = async () => {
  try {
    console.log('Fetching notifications...');
    const response = await api.get('/notifications');
    console.log('Notifications response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread/count');
    return response;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/mark-all-read');
    return response;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

export const deleteAllRead = async () => {
  try {
    const response = await api.delete('/notifications/delete-all-read');
    return response;
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw error;
  }
};