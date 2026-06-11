import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getChildren, deleteChild, updateChild } from '../../services/childService';
import { FiEdit2, FiCalendar, FiUser, FiPlus, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ChildrenList = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChild, setEditingChild] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    birthWeight: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await getChildren();
      
      let childrenData = [];
      
      if (response.data) {
        if (typeof response.data === 'string') {
          try {
            childrenData = JSON.parse(response.data);
          } catch (e) {
            console.error('Error parsing children data:', e);
            childrenData = [];
          }
        } else if (Array.isArray(response.data)) {
          childrenData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          childrenData = [response.data];
        }
      }
      
      setChildren(childrenData);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children');
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age + ' years';
    } catch (e) {
      console.error('Error calculating age:', e);
      return 'Unknown';
    }
  };

  const handleEditClick = (child) => {
    setEditingChild(child);
    setEditFormData({
      name: child.name || '',
      dob: child.dob ? new Date(child.dob).toISOString().split('T')[0] : '',
      gender: child.gender || 'Male',
      bloodGroup: child.bloodGroup || '',
      birthWeight: child.birthWeight || ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.name || !editFormData.dob) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const response = await updateChild(editingChild.id, editFormData);
      
      if (response.data && response.data.success) {
        toast.success('Child updated successfully');
        setShowEditModal(false);
        fetchChildren();
      } else {
        toast.error(response.data?.message || 'Failed to update child');
      }
    } catch (error) {
      console.error('Error updating child:', error);
      toast.error(error.response?.data?.message || 'Failed to update child');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (child) => {
    setChildToDelete(child);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!childToDelete) return;
    
    try {
      setLoading(true);
      const response = await deleteChild(childToDelete.id);
      
      if (response.data && response.data.success) {
        toast.success('Child deleted successfully');
        setShowDeleteModal(false);
        setChildToDelete(null);
        fetchChildren();
      } else {
        toast.error(response.data?.message || 'Failed to delete child');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error(error.response?.data?.message || 'Failed to delete child');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setChildToDelete(null);
  };

  const handleViewSchedule = (childId) => {
    navigate(`/parent/child/${childId}/schedule`);
  };

  if (loading && children.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Children</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your children's vaccinations</p>
        </div>
        <Link
          to="/parent/add-child"
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          Add New Child
        </Link>
      </div>

      {/* Children Grid */}
      {!Array.isArray(children) || children.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full">
              <FiUser className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Children Added</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't added any children yet. Add your first child to start tracking their vaccinations.</p>
          <Link
            to="/parent/add-child"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FiPlus className="h-5 w-5" />
            Add Your First Child
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div key={child?.id || Math.random()} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                      <FiUser className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{child?.name || 'Unknown'}</h3>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-full">
                    {child?.gender || 'Not specified'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date of Birth:</span>{' '}
                    {child?.dob ? new Date(child.dob).toLocaleDateString() : 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Age:</span>{' '}
                    {calculateAge(child?.dob)}
                  </p>
                  {child?.bloodGroup && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Blood Group:</span> {child.bloodGroup}
                    </p>
                  )}
                  {child?.birthWeight && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Birth Weight:</span> {child.birthWeight} kg
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewSchedule(child.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FiCalendar className="h-4 w-4" />
                    View Schedule
                  </button>
                  <button
                    onClick={() => handleEditClick(child)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400"
                    title="Edit child"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(child)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                    title="Delete child"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingChild && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Child</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child's Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter child's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={editFormData.dob}
                  onChange={handleEditInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={editFormData.gender}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={editFormData.bloodGroup}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Blood Group</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birth Weight (kg)
                </label>
                <input
                  type="number"
                  name="birthWeight"
                  value={editFormData.birthWeight}
                  onChange={handleEditInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter birth weight"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <FiSave className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && childToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Child</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Are you sure you want to delete {childToDelete.name}? This action cannot be undone and will remove all vaccination schedules for this child.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenList;