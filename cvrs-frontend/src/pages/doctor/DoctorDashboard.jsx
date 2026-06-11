import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiUser,
  FiUsers,
  FiActivity,
  FiArrowRight,
  FiGrid,
  FiBarChart2
} from 'react-icons/fi';
import { getDoctorAppointments, updateAppointmentStatus } from '../../services/doctorService';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { dashboardLayout } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getDoctorAppointments();
      
      let appointmentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          appointmentsData = response.data.data;
        }
      }
      
      setAppointments(appointmentsData);
      
      const today = new Date().toDateString();
      const todayAppointments = appointmentsData.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
      );
      
      setStats({
        today: todayAppointments.length,
        pending: appointmentsData.filter(apt => apt.status === 'PENDING').length,
        confirmed: appointmentsData.filter(apt => apt.status === 'CONFIRMED').length,
        completed: appointmentsData.filter(apt => apt.status === 'COMPLETED').length
      });
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await updateAppointmentStatus(id, status);
      if (response.data && response.data.success) {
        toast.success(`Appointment marked as ${status}`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <FiClock className="h-4 w-4" />;
      case 'COMPLETED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <FiXCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderDefaultLayout = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome, Dr. {user?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.today}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FiCheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <FiActivity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Appointments</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCalendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                      <FiUser className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{apt.child?.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vaccine: {apt.vaccine?.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Date: {new Date(apt.appointmentDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full border ${getStatusColor(apt.status)}`}>
                      {getStatusIcon(apt.status)}
                      {apt.status}
                    </span>
                    {apt.status === 'PENDING' && (
                      <button
                        onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link 
            to="/doctor/appointments" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All Appointments →
          </Link>
        </div>
      </div>
    </div>
  );

  const renderCompactLayout = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Confirmed</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Activity</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {appointments.slice(0, 3).map((apt) => (
            <div key={apt.id} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
              <span>{apt.child?.name} - {apt.vaccine?.name}</span>
              <span className={`px-2 py-0.5 rounded-full ${
                apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {apt.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayout = () => {
    switch(dashboardLayout) {
      case 'doctor-compact':
        return renderCompactLayout();
      case 'doctor-default':
      default:
        return renderDefaultLayout();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return renderLayout();
};

export default DoctorDashboard;