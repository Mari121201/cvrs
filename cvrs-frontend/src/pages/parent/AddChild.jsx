import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addChild } from '../../services/childService';
import { FiUser, FiCalendar, FiUsers, FiArrowLeft, FiDroplet } from 'react-icons/fi';
import { FaWeight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddChild = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    birthWeight: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dob || !formData.gender) {
      toast.error('Please fill in all mandatory fields');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting child data:', formData);
      
      const response = await addChild(formData);
      
      console.log('Add child response:', response);
      
      if (response.data && response.data.success) {
        toast.success('Child added successfully!');
        navigate('/parent/children');
      } else {
        toast.error(response.data?.message || 'Failed to add child');
      }
    } catch (error) {
      console.error('Error adding child:', error);
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        toast.error(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.log('Error request:', error.request);
        toast.error('No response from server. Please check if backend is running.');
      } else {
        console.log('Error message:', error.message);
        toast.error('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/parent/children"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Children
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 px-6 py-4">
          <h1 className="text-xl font-semibold text-white">Add New Child</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Child Name - Mandatory */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Child's Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter child's full name"
              />
            </div>
          </div>

          {/* Date of Birth - Mandatory */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="date"
                id="dob"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Gender - Mandatory */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUsers className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent appearance-none bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Blood Group - Optional */}
          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blood Group <span className="text-gray-400 dark:text-gray-500 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDroplet className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent appearance-none bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Blood Group (Optional)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Birth Weight - Optional */}
          <div>
            <label htmlFor="birthWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Birth Weight (kg) <span className="text-gray-400 dark:text-gray-500 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaWeight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="number"
                id="birthWeight"
                name="birthWeight"
                value={formData.birthWeight}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="10"
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter birth weight in kg (optional)"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Typical range: 2.5 - 4.5 kg</p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/parent/children')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>

      {/* Information Card */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Important Information</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
            <span className="font-medium">Mandatory fields:</span> Name, Date of Birth, and Gender are required
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
            <span className="font-medium">Optional fields:</span> Blood Group and Birth Weight can be added later
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
            Vaccination schedules will be automatically created based on your child's date of birth
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
            You'll receive notifications for upcoming vaccinations
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AddChild;