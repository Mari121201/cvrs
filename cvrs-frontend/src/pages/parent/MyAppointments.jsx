import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointments } from '../../services/appointmentService';
import { FiCalendar, FiUser, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments();
      console.log('My appointments:', response);
      
      let appointmentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          appointmentsData = response.data.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          appointmentsData = response.data.content;
        }
      }
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <FiClock className="h-4 w-4" />;
      case 'CANCELLED':
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiAlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'Confirmed - Doctor has approved your appointment. You will receive an email confirmation.';
      case 'COMPLETED':
        return 'Completed - Vaccination done. Thank you for using CVRS!';
      case 'PENDING':
        return 'Pending - Waiting for doctor confirmation. You will receive an email once confirmed.';
      case 'CANCELLED':
        return 'Cancelled - Appointment was cancelled. Check the reason below.';
      default:
        return status || 'Unknown';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status?.toLowerCase() === filter.toLowerCase();
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length
  };

  const handleBookNew = () => {
    navigate('/parent/book-appointment');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your vaccination appointment status</p>
          </div>
          <button
            onClick={handleBookNew}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiCalendar className="h-4 w-4" />
            Book New Appointment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400">Confirmed</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600 dark:text-red-400">Cancelled</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === filterOption
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No appointments found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't booked any appointments yet." 
                : `No ${filter} appointments found.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={handleBookNew}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                Book Your First Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                      <FiUser className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {apt.child?.name || 'Unknown Child'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vaccine: {apt.vaccine?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Doctor: Dr. {apt.doctor?.name || 'N/A'} 
                        {apt.doctor?.specialization && ` (${apt.doctor.specialization})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(apt.appointmentDate).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full border ${getStatusColor(apt.status)}`}>
                        {getStatusIcon(apt.status)}
                        {apt.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs text-right">
                      {getStatusText(apt.status)}
                    </p>
                    
                    {apt.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                        Note: {apt.notes}
                      </p>
                    )}

                    {/* Show cancellation reason if appointment is cancelled */}
                    {apt.status === 'CANCELLED' && apt.cancellationReason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 w-full">
                        <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
                          <FiXCircle className="h-3 w-3" />
                          <span className="font-medium">Cancellation Reason:</span> {apt.cancellationReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;