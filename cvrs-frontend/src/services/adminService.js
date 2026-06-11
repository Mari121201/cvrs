import api from './api';

// ==================== DASHBOARD STATS ====================

export const getRecentActivities = async () => {
  try {
    console.log('Fetching recent activities...');
    const response = await api.get('/admin/activities/recent');
    console.log('Recent activities response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return { data: [] };
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== DOCTOR MANAGEMENT ====================

export const getAllDoctors = async () => {
  try {
    const response = await api.get('/admin/doctors');
    return response;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const addDoctor = async (data) => {
  try {
    const response = await api.post('/admin/doctors', data);
    return response;
  } catch (error) {
    console.error('Error adding doctor:', error);
    throw error;
  }
};

export const updateDoctor = async (id, data) => {
  try {
    const response = await api.put(`/admin/doctors/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

export const deleteDoctor = async (id) => {
  try {
    const response = await api.delete(`/admin/doctors/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
};

// ==================== VACCINE MANAGEMENT ====================

export const getAllVaccines = async () => {
  try {
    const response = await api.get('/admin/vaccines');
    return response;
  } catch (error) {
    console.error('Error fetching vaccines:', error);
    throw error;
  }
};

export const addVaccine = async (data) => {
  try {
    const response = await api.post('/admin/vaccines', data);
    return response;
  } catch (error) {
    console.error('Error adding vaccine:', error);
    throw error;
  }
};

export const updateVaccine = async (id, data) => {
  try {
    const response = await api.put(`/admin/vaccines/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating vaccine:', error);
    throw error;
  }
};

export const deleteVaccine = async (id) => {
  try {
    const response = await api.delete(`/admin/vaccines/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting vaccine:', error);
    throw error;
  }
};

// ==================== APPOINTMENT MANAGEMENT ====================

export const getAllAppointments = async () => {
  try {
    const response = await api.get('/admin/appointments');
    return response;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id, status, cancellationReason = '') => {
  try {
    let url = `/admin/appointments/${id}/status?status=${status}`;
    if (cancellationReason) {
      url += `&cancellationReason=${encodeURIComponent(cancellationReason)}`;
    }
    const response = await api.put(url);
    return response;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const updateAppointmentDateTime = async (id, data) => {
  try {
    console.log(`Rescheduling appointment ${id} with data:`, data);
    const response = await api.put(`/admin/appointments/${id}/reschedule`, data);
    console.log('Reschedule response:', response);
    return response;
  } catch (error) {
    console.error('Error updating appointment date/time:', error);
    throw error;
  }
};

// ==================== PUBLIC ENDPOINTS ====================

export const getAllDoctorsPublic = async () => {
  try {
    const response = await api.get('/public/doctors');
    return response;
  } catch (error) {
    console.error('Error fetching doctors from public endpoint:', error);
    throw error;
  }
};

export const getAllVaccinesPublic = async () => {
  try {
    const response = await api.get('/public/vaccines');
    return response;
  } catch (error) {
    console.error('Error fetching vaccines from public endpoint:', error);
    throw error;
  }
};

export const bookAppointment = async (bookingData) => {
  try {
    const response = await api.post('/appointments/book', bookingData);
    return response;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};