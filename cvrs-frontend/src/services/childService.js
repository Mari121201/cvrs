import api from './api';

export const getChildren = async () => {
  try {
    console.log('Fetching children...');
    const response = await api.get('/getChildren');
    console.log('Get children response:', response);
    
    // Ensure we always return an array in the data property
    let processedData = [];
    
    if (response.data) {
      if (typeof response.data === 'string') {
        try {
          processedData = JSON.parse(response.data);
        } catch (e) {
          console.error('Error parsing response data:', e);
          processedData = [];
        }
      } else if (Array.isArray(response.data)) {
        processedData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single object, wrap in array
        processedData = [response.data];
      }
    }
    
    // Return with data property as array
    return { ...response, data: processedData };
  } catch (error) {
    console.error('Error in getChildren:', error);
    // Return empty array on error
    return { data: [] };
  }
};

export const addChild = async (childData) => {
  try {
    console.log('Adding child with data:', childData);
    const response = await api.post('/addChildren', childData);
    console.log('Add child response:', response);
    return response;
  } catch (error) {
    console.error('Error in addChild:', error);
    throw error;
  }
};

export const updateChild = async (id, childData) => {
  try {
    console.log(`Updating child ${id} with data:`, childData);
    const response = await api.put(`/updateChild/${id}`, childData);
    console.log('Update child response:', response);
    return response;
  } catch (error) {
    console.error('Error in updateChild:', error);
    throw error;
  }
};

export const deleteChild = async (id) => {
  try {
    console.log(`Deleting child with ID: ${id}`);
    const response = await api.delete(`/deleteChild/${id}`);
    console.log('Delete child response:', response);
    return response;
  } catch (error) {
    console.error('Error in deleteChild:', error);
    throw error;
  }
};

export const getChildById = async (id) => {
  // Validate ID before making request
  if (!id || id === 'undefined' || id === 'null') {
    console.error('Invalid child ID:', id);
    return { data: null };
  }
  
  try {
    console.log(`Fetching child with ID: ${id}`);
    const response = await api.get(`/getChildren/${id}`);
    return response;
  } catch (error) {
    console.error('Error in getChildById:', error);
    return { data: null };
  }
};

export const getChildSchedule = async (childId) => {
  // Validate childId before making request
  if (!childId || childId === 'undefined' || childId === 'null') {
    console.error('Invalid child ID for schedule:', childId);
    return { data: [] };
  }
  
  try {
    console.log(`Fetching schedule for child ID: ${childId}`);
    const response = await api.get(`/schedule/${childId}`);
    
    // Ensure we always return an array
    let scheduleData = [];
    if (response.data) {
      if (typeof response.data === 'string') {
        try {
          scheduleData = JSON.parse(response.data);
        } catch (e) {
          scheduleData = [];
        }
      } else if (Array.isArray(response.data)) {
        scheduleData = response.data;
      }
    }
    
    return { ...response, data: scheduleData };
  } catch (error) {
    console.error('Error in getChildSchedule:', error);
    return { data: [] };
  }
};

export const markVaccinationComplete = async (scheduleId) => {
  if (!scheduleId) {
    console.error('Invalid schedule ID');
    throw new Error('Schedule ID is required');
  }
  
  try {
    const response = await api.put(`/schedule/complete/${scheduleId}`);
    return response;
  } catch (error) {
    console.error('Error in markVaccinationComplete:', error);
    throw error;
  }
};

export const getAllVaccines = async () => {
  try {
    const response = await api.get('/vaccines');
    
    // Ensure we always return an array
    let vaccinesData = [];
    if (response.data) {
      if (typeof response.data === 'string') {
        try {
          vaccinesData = JSON.parse(response.data);
        } catch (e) {
          vaccinesData = [];
        }
      } else if (Array.isArray(response.data)) {
        vaccinesData = response.data;
      }
    }
    
    return { ...response, data: vaccinesData };
  } catch (error) {
    console.error('Error in getAllVaccines:', error);
    return { data: [] };
  }
};