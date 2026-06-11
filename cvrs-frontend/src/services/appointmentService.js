import api from './api';

export const getMyAppointments = async () => {
  try {
    console.log('Fetching my appointments...');
    const response = await api.get('/appointments/my');
    console.log('My appointments response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching my appointments:', error);
    throw error;
  }
};

export const getAppointmentById = async (id) => {
  try {
    const response = await api.get(`/appointments/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (id) => {
  try {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};