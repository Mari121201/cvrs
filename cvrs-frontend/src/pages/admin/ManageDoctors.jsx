import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiTrash2, 
  FiPlus,
  FiSearch,
  FiEye,
  FiLock,
  FiUserPlus,
  FiBriefcase,
  FiAward,
  FiRefreshCw,
  FiX,
  FiSave
} from 'react-icons/fi';
import { getAllDoctors, addDoctor, updateDoctor, deleteDoctor } from '../../services/adminService';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const ManageDoctors = () => {
  const { darkMode } = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    specialization: '',
    licenseNumber: '',
    experience: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching doctors...');
      
      const response = await getAllDoctors();
      console.log('Doctors API response:', response);
      
      let doctorsData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          doctorsData = response.data;
        } else if (typeof response.data === 'object') {
          if (response.data.data && Array.isArray(response.data.data)) {
            doctorsData = response.data.data;
          } else if (response.data.content && Array.isArray(response.data.content)) {
            doctorsData = response.data.content;
          } else if (Object.keys(response.data).length > 0) {
            doctorsData = [response.data];
          }
        }
      }
      
      console.log('Processed doctors data:', doctorsData);
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
      
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
      toast.error('Failed to load doctors');
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    if (!Array.isArray(doctors)) {
      setFilteredDoctors([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = doctors.filter(doctor => 
      (doctor.name?.toLowerCase() || '').includes(term) ||
      (doctor.email?.toLowerCase() || '').includes(term) ||
      (doctor.specialization?.toLowerCase() || '').includes(term)
    );
    setFilteredDoctors(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      specialization: '',
      licenseNumber: '',
      experience: ''
    });
    setEditingDoctor(null);
  };

  const handleEditClick = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      password: '',
      phone: doctor.phone || '',
      address: doctor.address || '',
      specialization: doctor.specialization || '',
      licenseNumber: doctor.licenseNumber || '',
      experience: doctor.experience ? doctor.experience.toString() : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }
    
    if (!editingDoctor && !formData.password) {
      toast.error('Password is required for new doctors');
      return;
    }
    
    try {
      setLoading(true);
      
      // Parse experience as float to handle decimal values
      let experienceValue = 0;
      if (formData.experience && formData.experience.trim() !== '') {
        experienceValue = parseFloat(formData.experience);
        if (isNaN(experienceValue)) {
          experienceValue = 0;
        }
      }
      
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.address || '',
        specialization: formData.specialization || '',
        licenseNumber: formData.licenseNumber || '',
        experience: experienceValue
      };
      
      // Only include password if provided
      if (formData.password && formData.password.trim() !== '') {
        submitData.password = formData.password;
      }
      
      console.log('Submitting data:', submitData);
      
      let response;
      if (editingDoctor) {
        response = await updateDoctor(editingDoctor.id, submitData);
      } else {
        response = await addDoctor(submitData);
      }
      
      console.log('Submit response:', response);
      
      if (response.data && response.data.success) {
        toast.success(editingDoctor ? 'Doctor updated successfully' : 'Doctor added successfully');
        setShowModal(false);
        resetForm();
        fetchDoctors();
      } else {
        toast.error(response.data?.message || 'Operation failed');
      }
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (doctor) => {
    setViewingDoctor(doctor);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        setLoading(true);
        const response = await deleteDoctor(id);
        
        if (response.data && response.data.success) {
          toast.success('Doctor deleted successfully');
          fetchDoctors();
        } else {
          toast.error(response.data?.message || 'Failed to delete doctor');
        }
      } catch (error) {
        console.error('Error deleting doctor:', error);
        toast.error(error.response?.data?.message || 'Failed to delete doctor');
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateStats = () => {
    if (!Array.isArray(doctors)) {
      return { total: 0, specializations: 0, avgExperience: 0 };
    }
    
    const total = doctors.length;
    const specializations = new Set(doctors.map(d => d.specialization).filter(Boolean)).size;
    
    // Calculate average experience with decimal precision
    let avgExperience = 0;
    if (total > 0) {
      const sumExperience = doctors.reduce((acc, d) => {
        // Parse experience as float to handle decimal values
        const exp = parseFloat(d.experience) || 0;
        return acc + exp;
      }, 0);
      
      // Calculate average and round to 1 decimal place
      avgExperience = Math.round((sumExperience / total) * 10) / 10;
    }
    
    return { total, specializations, avgExperience };
  };

  // Format experience for display
  const formatExperience = (exp) => {
    if (exp === undefined || exp === null) return '0';
    const numExp = parseFloat(exp);
    if (isNaN(numExp)) return '0';
    
    // Show one decimal place if it's not a whole number
    if (numExp % 1 === 0) {
      return numExp.toString();
    } else {
      return numExp.toFixed(1);
    }
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiUser className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchDoctors}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Doctors</h1>
          <p className="text-gray-600 dark:text-gray-400">Add and manage doctor accounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiUserPlus className="h-5 w-5" />
          Add New Doctor
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
            placeholder="Search doctors by name, email or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Doctors</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Specializations</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.specializations}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Experience</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.avgExperience} {stats.avgExperience === 1 ? 'yr' : 'yrs'}
          </p>
        </div>
      </div>

      {/* Doctors Grid */}
      {Array.isArray(filteredDoctors) && filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                      <FiUser className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                      <p className="text-sm text-primary-600 dark:text-primary-400">{doctor.specialization || 'General Physician'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(doctor)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="View"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(doctor)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiMail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span>{doctor.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FiPhone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                  {doctor.specialization && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FiBriefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>{doctor.specialization}</span>
                    </div>
                  )}
                  {doctor.licenseNumber && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FiAward className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>License: {doctor.licenseNumber}</span>
                    </div>
                  )}
                  {doctor.experience !== undefined && doctor.experience !== null && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FiBriefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>Experience: {formatExperience(doctor.experience)} years</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
              <FiUser className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No doctors found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'No doctors match your search criteria' 
                : 'Add your first doctor to get started'}
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
                Add First Doctor
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
          <div className="relative p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter doctor's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="doctor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password {!editingDoctor && <span className="text-red-500">*</span>}
                    {editingDoctor && <span className="text-gray-400 text-xs ml-2">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingDoctor}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder={editingDoctor ? "Enter new password" : "Enter password"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Pediatrician"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Medical license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 1.5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    rows="2"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter address"
                  />
                </div>
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
                  {loading ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Add Doctor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Doctor Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <FiUser className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingDoctor.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: #{viewingDoctor.id}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Email:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{viewingDoctor.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Phone:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{viewingDoctor.phone || 'Not provided'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Specialization:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{viewingDoctor.specialization || 'General'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">License Number:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{viewingDoctor.licenseNumber || 'Not provided'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Experience:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatExperience(viewingDoctor.experience)} years
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Address:</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{viewingDoctor.address || 'Not provided'}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(viewingDoctor);
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;