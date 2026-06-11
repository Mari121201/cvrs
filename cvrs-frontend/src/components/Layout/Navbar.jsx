import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiLogOut, FiUser, FiMenu, FiSun, FiMoon, FiShield, FiUserCheck, FiHome } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    const routeRole = user.role === 'DOCTOR' ? 'admin' : user.role.toLowerCase();
    return `/${routeRole}/dashboard`;
  };

  // Get role display with icon
  const getRoleDisplay = () => {
    if (user.role === 'ADMIN') {
      return {
        icon: <FiShield className="h-3 w-3 mr-1" />,
        text: 'Administrator',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-600 dark:text-purple-400'
      };
    } else if (user.role === 'DOCTOR') {
      return {
        icon: <FiUserCheck className="h-3 w-3 mr-1" />,
        text: 'Doctor',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-600 dark:text-blue-400'
      };
    } else {
      return {
        icon: <FiUser className="h-3 w-3 mr-1" />,
        text: 'Parent',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-600 dark:text-green-400'
      };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none mr-2"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <Link to={getDashboardRoute()} className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">CVRS</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Child Vaccination Record System</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                <div className="flex items-center justify-end">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleDisplay.bgColor} ${roleDisplay.textColor}`}>
                    {roleDisplay.icon}
                    {roleDisplay.text}
                  </span>
                </div>
              </div>
              
              <div className={`h-8 w-8 rounded-full ${roleDisplay.bgColor} flex items-center justify-center`}>
                <FiUser className={`h-4 w-4 ${roleDisplay.textColor}`} />
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Logout"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-4 py-3 space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleDisplay.bgColor} ${roleDisplay.textColor}`}>
                {roleDisplay.icon}
                {roleDisplay.text}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;