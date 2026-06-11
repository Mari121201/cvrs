import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiMoon, 
  FiSun, 
  FiSave,
  FiEye,
  FiEyeOff,
  FiSmartphone,
  FiGlobe,
  FiShield,
  FiGrid,
  FiLayout,
  FiCheck,
  FiRefreshCw,
  FiDroplet,
  FiLayers,
  FiZap,
  FiTrendingUp,
  FiBarChart2,
  FiActivity,
  FiClock,
  FiCalendar,
  FiUsers,
  FiHeart,
  FiAward,
  FiBriefcase,
  FiMap,
  FiPackage,
  FiStar,
  FiCompass
} from 'react-icons/fi';
import { updateUser, changePassword, getUserById } from '../services/userService';
import { getUserSettings, saveUserSettings } from '../services/settingsService';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { 
    darkMode, 
    toggleDarkMode,
    dashboardLayout,
    changeDashboardLayout
  } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isDirty, setIsDirty] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Load user data from database on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Track if profile data has changed
  useEffect(() => {
    if (user) {
      const hasChanged = 
        profileData.name !== (user.name || '') ||
        profileData.phone !== (user.phone || '') ||
        profileData.address !== (user.address || '');
      setIsDirty(hasChanged);
    }
  }, [profileData, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await getUserById(user.id);
        if (response.data) {
          const userData = response.data;
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: null
      });
    }
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const response = await updateUser(user.id, profileData);
      
      if (response.data && response.data.success) {
        updateAuthUser({ 
          ...user, 
          ...profileData 
        });
        setIsDirty(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data && response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
      } else {
        toast.error(response.data?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Dashboard Layout Previews
  const LayoutPreviews = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {/* Default Layout */}
      <div 
        onClick={() => changeDashboardLayout('default')}
        className={`relative cursor-pointer overflow-hidden rounded-xl transition-all transform hover:scale-105 ${
          dashboardLayout === 'default' 
            ? 'ring-4 ring-primary-600 dark:ring-primary-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' 
            : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-primary-300 dark:hover:ring-primary-700'
        }`}
      >
        {dashboardLayout === 'default' && (
          <div className="absolute top-2 right-2 z-10 bg-primary-600 dark:bg-primary-400 text-white rounded-full p-1">
            <FiCheck className="h-4 w-4" />
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
              <FiLayout className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <span className="font-semibold text-gray-800 dark:text-white block mb-2">Default</span>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Clean • Professional</p>
        </div>
      </div>

      {/* Analytics Layout */}
      <div 
        onClick={() => changeDashboardLayout('analytics')}
        className={`relative cursor-pointer overflow-hidden rounded-xl transition-all transform hover:scale-105 ${
          dashboardLayout === 'analytics' 
            ? 'ring-4 ring-primary-600 dark:ring-primary-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' 
            : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-primary-300 dark:hover:ring-primary-700'
        }`}
      >
        {dashboardLayout === 'analytics' && (
          <div className="absolute top-2 right-2 z-10 bg-primary-600 dark:bg-primary-400 text-white rounded-full p-1">
            <FiCheck className="h-4 w-4" />
          </div>
        )}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-2 rounded-lg">
              <FiTrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <span className="font-semibold text-gray-800 dark:text-white block mb-2">Analytics</span>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              <div className="h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded"></div>
              <div className="h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded"></div>
              <div className="h-8 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
            </div>
            <div className="h-12 bg-gradient-to-r from-blue-300 to-purple-300 rounded"></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">Charts • Analytics • Insights</p>
        </div>
      </div>

      {/* Compact Layout */}
      <div 
        onClick={() => changeDashboardLayout('compact')}
        className={`relative cursor-pointer overflow-hidden rounded-xl transition-all transform hover:scale-105 ${
          dashboardLayout === 'compact' 
            ? 'ring-4 ring-primary-600 dark:ring-primary-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' 
            : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-primary-300 dark:hover:ring-primary-700'
        }`}
      >
        {dashboardLayout === 'compact' && (
          <div className="absolute top-2 right-2 z-10 bg-primary-600 dark:bg-primary-400 text-white rounded-full p-1">
            <FiCheck className="h-4 w-4" />
          </div>
        )}
        <div className="bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white dark:bg-gray-700 shadow-md p-2 rounded-lg">
              <FiGrid className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <span className="font-semibold text-gray-800 dark:text-white block mb-2">Compact</span>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">Quick Stats • Focused</p>
        </div>
      </div>
    </div>
  );

  if (loading && !profileData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Settings</h1>
      
      {/* Centered Tabs */}
      <div className="flex justify-center mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'appearance'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'security'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Security
            </button>
          </nav>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Profile Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSmartphone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiGlobe className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <textarea
                      name="address"
                      rows="3"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={saveProfile}
                    disabled={loading || !isDirty}
                    className={`flex items-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                      loading || !isDirty ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? <FiRefreshCw className="h-5 w-5 animate-spin" /> : <FiSave className="h-5 w-5" />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <div className="space-y-8">
              {/* Theme Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Theme Settings</h2>
                
                <div className="flex items-center justify-between max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    {darkMode ? (
                      <FiMoon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <FiSun className="h-8 w-8 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Switch between light and dark themes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      darkMode ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={darkMode}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dashboard Layout Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  Dashboard Layout
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                  Choose how your dashboard should look. Changes are saved automatically when you select a layout.
                </p>
                
                <LayoutPreviews />
                
                {/* Live Preview */}
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl max-w-3xl mx-auto">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Live Preview</h3>
                  <div className="space-y-3">
                    {dashboardLayout === 'default' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-2">
                              <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                              <div className="h-5 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 h-20">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                          <div className="h-8 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    )}
                    {dashboardLayout === 'analytics' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded"></div>
                          <div className="h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded"></div>
                          <div className="h-12 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
                        </div>
                        <div className="h-16 bg-gradient-to-r from-blue-300 to-purple-300 rounded"></div>
                      </div>
                    )}
                    {dashboardLayout === 'compact' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-2">
                            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                            <div className="h-5 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-2">
                            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                            <div className="h-5 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 h-16">
                          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 space-y-1 text-center">
                  <p className="flex items-center gap-2 justify-center">
                    <FiCheck className="h-4 w-4 text-green-500" />
                    Changes are saved automatically when you select a layout
                  </p>
                  <p className="flex items-center gap-2 justify-center">
                    <FiCheck className="h-4 w-4 text-green-500" />
                    Your preference will be remembered when you log in again
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Change Password</h2>
              
              <div className="space-y-6">
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`pl-10 pr-10 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        passwordErrors.currentPassword 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`pl-10 pr-10 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        passwordErrors.newPassword 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`pl-10 pr-10 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        passwordErrors.confirmPassword 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className={`flex items-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? <FiRefreshCw className="h-5 w-5 animate-spin" /> : <FiShield className="h-5 w-5" />}
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;