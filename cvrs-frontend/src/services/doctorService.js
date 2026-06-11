import api from './api';

export const getDoctorAppointments = async () => {
  try {
    const response = await api.get('/doctor/appointments');
    return response;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await api.put(`/doctor/appointments/${id}/status?status=${status}`);
    return response;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const getDoctorStats = async () => {
  try {
    const response = await api.get('/doctor/stats');
    return response;
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    throw error;
  }
};