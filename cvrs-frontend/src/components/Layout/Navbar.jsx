import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiLogOut, FiUser, FiMenu, FiSun, FiMoon, FiShield, FiUserCheck, FiHome,
  FiUsers, FiCalendar, FiUserPlus, FiActivity, FiSettings, FiDroplet, FiX
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lock body scroll when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
      document.body.style.removeProperty('--scrollbar-width');
    }
    return () => {
      document.body.classList.remove('body-no-scroll');
      document.body.style.removeProperty('--scrollbar-width');
    };
  }, [isDrawerOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeDrawer = () => setIsDrawerOpen(false);
  const openDrawer = () => setIsDrawerOpen(true);

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    const routeRole = user.role === 'DOCTOR' ? 'admin' : user.role.toLowerCase();
    return `/${routeRole}/dashboard`;
  };

  // Get role display for top navbar dropdown
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

  // Get navigation items for drawer based on user role
  const getDrawerNavItems = () => {
    if (user.role === 'ADMIN' || user.role === 'DOCTOR') {
      const items = [
        { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/admin/appointments', icon: FiCalendar, label: 'Appointments' },
        { to: '/admin/vaccines', icon: FiDroplet, label: 'Vaccines' },
      ];
      if (user.role === 'ADMIN') {
        items.push({ to: '/admin/doctors', icon: FiUserPlus, label: 'Manage Doctors' });
      }
      items.push({ to: '/settings', icon: FiSettings, label: 'Settings' });
      return items;
    } else {
      return [
        { to: '/parent/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/parent/children', icon: FiUsers, label: 'My Children' },
        { to: '/parent/add-child', icon: FiUserPlus, label: 'Add Child' },
        { to: '/parent/book-appointment', icon: FiCalendar, label: 'Book Appointment' },
        { to: '/parent/my-appointments', icon: FiActivity, label: 'My Appointments' },
        { to: '/settings', icon: FiSettings, label: 'Settings' },
      ];
    }
  };

  const roleDisplay = getRoleDisplay();
  const drawerNavItems = getDrawerNavItems();

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={openDrawer}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none mr-2"
                aria-label="Open menu"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <Link to={getDashboardRoute()} className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">CVRS</span>
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

              {/* Profile Icon with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`h-8 w-8 rounded-full ${roleDisplay.bgColor} flex items-center justify-center focus:outline-none hover:ring-2 hover:ring-primary-500 transition-all`}
                  aria-label="Profile menu"
                >
                  <FiUser className={`h-4 w-4 ${roleDisplay.textColor}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleDisplay.bgColor} ${roleDisplay.textColor}`}>
                          {roleDisplay.icon}
                          {roleDisplay.text}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors flex items-center gap-2"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer – Only Navigation Links (No User Info, No Logout) */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isDrawerOpen ? 'visible' : 'invisible'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeDrawer}
        ></div>

        <div
          className={`absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-out ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">CVRS</span>
              <button
                onClick={closeDrawer}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 overflow-y-auto">
              {drawerNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeDrawer}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;