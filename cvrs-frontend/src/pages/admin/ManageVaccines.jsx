import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiCalendar, FiSearch, FiX, FiSave, FiRefreshCw } from 'react-icons/fi';
import { getAllVaccines, addVaccine, updateVaccine, deleteVaccine } from '../../services/adminService';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const ManageVaccines = () => {
  const { darkMode } = useTheme();
  const [vaccines, setVaccines] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ageInMonths: ''
  });

  useEffect(() => {
    fetchVaccines();
  }, []);

  useEffect(() => {
    filterVaccines();
  }, [searchTerm, vaccines]);

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching vaccines...');
      
      const response = await getAllVaccines();
      console.log('Vaccines API response:', response);
      
      // Handle different response formats
      let vaccinesData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // If data is already an array
          vaccinesData = response.data;
        } else if (typeof response.data === 'object') {
          // If data is an object with a data property that's an array
          if (response.data.data && Array.isArray(response.data.data)) {
            vaccinesData = response.data.data;
          } 
          // If it's a single object, wrap it in an array
          else if (Object.keys(response.data).length > 0) {
            // Check if it might be a paginated response with content property
            if (response.data.content && Array.isArray(response.data.content)) {
              vaccinesData = response.data.content;
            } else {
              // Single object - wrap in array
              vaccinesData = [response.data];
            }
          }
        }
      }
      
      console.log('Processed vaccines data:', vaccinesData);
      setVaccines(vaccinesData);
      setFilteredVaccines(vaccinesData);
      
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      setError('Failed to load vaccines. Please try again.');
      toast.error('Failed to load vaccines');
      setVaccines([]);
      setFilteredVaccines([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVaccines = () => {
    if (!Array.isArray(vaccines)) {
      setFilteredVaccines([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredVaccines(vaccines);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = vaccines.filter(vaccine => 
      (vaccine.name?.toLowerCase() || '').includes(term)
    );
    setFilteredVaccines(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.ageInMonths) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const submitData = {
        name: formData.name,
        ageInMonths: parseInt(formData.ageInMonths)
      };
      
      console.log('Submitting vaccine data:', submitData);
      
      let response;
      if (editingVaccine) {
        response = await updateVaccine(editingVaccine.id, submitData);
      } else {
        response = await addVaccine(submitData);
      }
      
      console.log('Submit response:', response);
      
      if (response.data && response.data.success) {
        toast.success(editingVaccine ? 'Vaccine updated successfully' : 'Vaccine added successfully');
        setShowModal(false);
        resetForm();
        fetchVaccines(); // Refresh the list
      } else {
        toast.error(response.data?.message || 'Operation failed');
      }
      
    } catch (error) {
      console.error('Error saving vaccine:', error);
      toast.error(error.response?.data?.message || 'Failed to save vaccine');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vaccine) => {
    setEditingVaccine(vaccine);
    setFormData({
      name: vaccine.name || '',
      ageInMonths: vaccine.ageInMonths ? vaccine.ageInMonths.toString() : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vaccine?')) {
      try {
        setLoading(true);
        const response = await deleteVaccine(id);
        
        if (response.data && response.data.success) {
          toast.success('Vaccine deleted successfully');
          fetchVaccines(); // Refresh the list
        } else {
          toast.error(response.data?.message || 'Failed to delete vaccine');
        }
      } catch (error) {
        console.error('Error deleting vaccine:', error);
        toast.error(error.response?.data?.message || 'Failed to delete vaccine');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', ageInMonths: '' });
    setEditingVaccine(null);
  };

  // Calculate stats
  const calculateStats = () => {
    if (!Array.isArray(vaccines)) {
      return { total: 0, infant: 0, toddler: 0 };
    }
    
    const total = vaccines.length;
    const infant = vaccines.filter(v => v.ageInMonths <= 6).length;
    const toddler = vaccines.filter(v => v.ageInMonths > 6 && v.ageInMonths <= 12).length;
    
    return { total, infant, toddler };
  };

  if (loading && vaccines.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading vaccines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiCalendar className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchVaccines}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiRefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Vaccines</h1>
          <p className="text-gray-600 dark:text-gray-400">Add and manage vaccine information</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          Add Vaccine
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search vaccines by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Vaccines</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">0-6 Months</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.infant}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">6-12 Months</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.toddler}</p>
        </div>
      </div>

      {/* Vaccines Grid */}
      {Array.isArray(filteredVaccines) && filteredVaccines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVaccines.map((vaccine) => (
            <div key={vaccine.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                      <FiCalendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{vaccine.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(vaccine)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vaccine.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Due at:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{vaccine.ageInMonths} months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {vaccine.ageInMonths <= 6 ? 'Infant' : vaccine.ageInMonths <= 12 ? 'Toddler' : 'Child'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
              <FiCalendar className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No vaccines found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'No vaccines match your search criteria' 
                : 'Add your first vaccine to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <FiPlus className="h-5 w-5" />
                Add First Vaccine
              </button>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vaccine Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., BCG, Polio, Hepatitis B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age in Months *
                </label>
                <input
                  type="number"
                  name="ageInMonths"
                  value={formData.ageInMonths}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 0, 2, 4, 6"
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Age in months determines when this vaccine is due. 
                  0 months means at birth.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
                  {loading ? 'Saving...' : (editingVaccine ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVaccines;