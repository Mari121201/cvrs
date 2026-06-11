import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        const { token, role, name, email: userEmail, id } = response.data;
        
        // Treat both ADMIN and DOCTOR as ADMIN for routing purposes
        const dashboardRole = role === 'DOCTOR' ? 'ADMIN' : role;
        
        localStorage.setItem('token', token);
        const userData = { 
          id, 
          email: userEmail, 
          role, // Keep original role for display
          dashboardRole, // Use for routing
          name,
          phone: response.data.phone || '',
          address: response.data.address || ''
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(token);
        setUser(userData);
        
        toast.success('Login successful!');
        return { success: true, role: dashboardRole };
      } else {
        toast.error(response.data?.message || 'Login failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Login failed';
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Registration successful! Please login.');
        return { success: true };
      } else {
        toast.error(response.data?.message || 'Registration failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Registration failed';
      toast.error(errorMessage);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    token,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};