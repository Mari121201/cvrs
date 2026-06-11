import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildrenList from './pages/parent/ChildrenList';
import AddChild from './pages/parent/AddChild';
import ChildSchedule from './pages/parent/ChildSchedule';
import BookAppointment from './pages/parent/BookAppointment';
import MyAppointments from './pages/parent/MyAppointments';

// Admin Pages (used by both ADMIN and DOCTOR)
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageVaccines from './pages/admin/ManageVaccines';
import AllAppointments from './pages/admin/AllAppointments';

// Settings Page
import Settings from './pages/Settings';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // For routing purposes, treat DOCTOR as ADMIN (both go to admin routes)
  const routeRole = user.role === 'DOCTOR' ? 'ADMIN' : user.role;
  
  if (allowedRoles && !allowedRoles.includes(routeRole)) {
    return <Navigate to={`/${routeRole.toLowerCase()}/dashboard`} replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }
  
  if (user) {
    // Both ADMIN and DOCTOR go to admin dashboard
    const routeRole = user.role === 'DOCTOR' ? 'ADMIN' : user.role;
    return <Navigate to={`/${routeRole.toLowerCase()}/dashboard`} replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const routeRole = user?.role === 'DOCTOR' ? 'ADMIN' : user?.role;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col transition-colors duration-300">
        {user && !isAuthPage && <Navbar />}
        
        <div className="flex flex-1">
          {user && !isAuthPage && <Sidebar />}
          
          <main className={`flex-1 ${user && !isAuthPage ? 'p-6' : ''}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Parent Routes */}
              <Route path="/parent/dashboard" element={
                <PrivateRoute allowedRoles={['PARENT']}>
                  <ParentDashboard />
                </PrivateRoute>
              } />
              <Route path="/parent/children" element={
                <PrivateRoute allowedRoles={['PARENT']}>
                  <ChildrenList />
                </PrivateRoute>
              } />
              <Route path="/parent/add-child" element={
                <PrivateRoute allowedRoles={['PARENT']}>
                  <AddChild />
                </PrivateRoute>
              } />
              <Route path="/parent/child/:id/schedule" element={
                <PrivateRoute allowedRoles={['PARENT']}>
                  <ChildSchedule />
                </PrivateRoute>
              } />
              <Route path="/parent/book-appointment" element={
                <PrivateRoute allowedRoles={['PARENT']}>
                  <BookAppointment />
                </PrivateRoute>
              } />
              <Route path="/parent/my-appointments" element={
                <PrivateRoute allowedRoles={['PARENT']}>
                  <MyAppointments />
                </PrivateRoute>
              } />
              
              {/* Admin Routes - Accessible by both ADMIN and DOCTOR */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/doctors" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <ManageDoctors />
                </PrivateRoute>
              } />
              <Route path="/admin/vaccines" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <ManageVaccines />
                </PrivateRoute>
              } />
              <Route path="/admin/appointments" element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AllAppointments />
                </PrivateRoute>
              } />
              
              {/* Settings Route - Accessible by all roles */}
              <Route path="/settings" element={
                <PrivateRoute allowedRoles={['PARENT', 'ADMIN']}>
                  <Settings />
                </PrivateRoute>
              } />
              
              {/* Default Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
        
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;