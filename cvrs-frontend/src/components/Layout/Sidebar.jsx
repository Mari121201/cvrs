import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiUserPlus,
  FiActivity,
  FiSettings,
  FiUserCheck,
  FiShield,
  FiClipboard,
  FiDroplet
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage || !user) {
    return null;
  }

  // Determine which sidebar to show based on role
  const isAdminOrDoctor = user.role === 'ADMIN' || user.role === 'DOCTOR';

  const getNavItems = () => {
    if (isAdminOrDoctor) {
      // Admin/Doctor sidebar - same for both except Manage Doctors
      const items = [
        { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/admin/appointments', icon: FiCalendar, label: 'Appointments' },
        { to: '/admin/vaccines', icon: FiDroplet, label: 'Vaccines' },
      ];
      
      // Only show Manage Doctors to ADMIN users (not to DOCTOR)
      if (user.role === 'ADMIN') {
        items.push({ to: '/admin/doctors', icon: FiUserPlus, label: 'Manage Doctors' });
      }
      
      return items;
    } else {
      // Parent sidebar
      return [
        { to: '/parent/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/parent/children', icon: FiUsers, label: 'My Children' },
        { to: '/parent/add-child', icon: FiUserPlus, label: 'Add Child' },
        { to: '/parent/book-appointment', icon: FiCalendar, label: 'Book Appointment' },
        { to: '/parent/my-appointments', icon: FiActivity, label: 'My Appointments' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-[calc(100vh-8rem)] border-r border-gray-200 dark:border-gray-700 hidden lg:block transition-colors duration-300">
      <nav className="mt-5 px-2 h-full relative pb-20">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActive 
                    ? 'text-primary-700 dark:text-primary-400' 
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                }`} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        {/* Settings Link - always at bottom */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <FiSettings className={`mr-3 h-5 w-5 ${
                  isActive 
                    ? 'text-primary-700 dark:text-primary-400' 
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                }`} />
                Settings
              </>
            )}
          </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;