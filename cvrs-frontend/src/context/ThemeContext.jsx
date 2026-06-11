import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getUserSettings, saveUserSettings } from '../services/settingsService';
import toast from 'react-hot-toast';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage immediately
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [dashboardLayout, setDashboardLayout] = useState(() => {
    // Initialize from localStorage immediately
    const savedLayout = localStorage.getItem('dashboardLayout');
    return savedLayout || 'default';
  });
  const [loading, setLoading] = useState(true);

  // Function to apply theme to HTML element
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply theme on initial load
  useEffect(() => {
    applyTheme(darkMode);
  }, []);

  // Load user preferences from database
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserSettings(user.id);
        if (response.data) {
          // Only update if database has values and they differ from current
          if (response.data.darkMode !== undefined && response.data.darkMode !== darkMode) {
            setDarkMode(response.data.darkMode);
            applyTheme(response.data.darkMode);
            localStorage.setItem('theme', response.data.darkMode ? 'dark' : 'light');
          }
          
          if (response.data.dashboardLayout && response.data.dashboardLayout !== dashboardLayout) {
            setDashboardLayout(response.data.dashboardLayout);
            localStorage.setItem('dashboardLayout', response.data.dashboardLayout);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, [user]); // Remove dashboardLayout and darkMode from dependencies

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Apply theme immediately
    applyTheme(newMode);
    
    // Save to localStorage
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    // Save to database if logged in
    if (user?.id) {
      try {
        await saveUserSettings(user.id, { darkMode: newMode });
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  const changeDashboardLayout = async (layout) => {
    setDashboardLayout(layout);
    
    // Save to localStorage
    localStorage.setItem('dashboardLayout', layout);
    
    // Save to database if logged in
    if (user?.id) {
      try {
        await saveUserSettings(user.id, { dashboardLayout: layout });
        toast.success('Dashboard layout updated successfully');
      } catch (error) {
        console.error('Error saving layout preference:', error);
        toast.error('Failed to save layout preference');
      }
    }
  };

  const value = {
    darkMode,
    dashboardLayout,
    toggleDarkMode,
    changeDashboardLayout,
    loading,
    userRole: user?.role
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};