import React, { useState, useEffect, useRef } from 'react';
import { 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiSearch,
  FiFilter,
  FiUser,
  FiDownload,
  FiXCircle,
  FiAlertCircle,
  FiUserPlus,
  FiRefreshCw,
  FiEdit2,
  FiSave,
  FiX
} from 'react-icons/fi';
import { getAllAppointments, updateAppointmentStatus, updateAppointmentDateTime } from '../../services/adminService';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AllAppointments = () => {
  const { darkMode } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, confirmed, cancelled, all
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState(null);
  
  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    appointmentDate: new Date(),
    notes: ''
  });
  
  // Loading state for confirm button to prevent double clicks
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, dateFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching appointments...');
      
      const response = await getAllAppointments();
      console.log('Appointments API response:', response);
      
      let appointmentsData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (typeof response.data === 'object') {
          if (response.data.data && Array.isArray(response.data.data)) {
            appointmentsData = response.data.data;
          } else if (response.data.content && Array.isArray(response.data.content)) {
            appointmentsData = response.data.content;
          }
        }
      }
      
      console.log('Processed appointments:', appointmentsData);
      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
      toast.error('Failed to load appointments');
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (!Array.isArray(appointments)) {
      setFilteredAppointments([]);
      return;
    }

    let filtered = [...appointments];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => 
        a.status && a.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);

      filtered = filtered.filter(a => {
        if (!a.appointmentDate) return false;
        
        try {
          const apptDate = new Date(a.appointmentDate);
          apptDate.setHours(0, 0, 0, 0);
          
          switch(dateFilter) {
            case 'today':
              return apptDate.getTime() === today.getTime();
            case 'tomorrow':
              return apptDate.getTime() === tomorrow.getTime();
            case 'thisWeek':
              return apptDate >= today && apptDate <= nextWeek;
            case 'thisMonth':
              return apptDate >= today && apptDate <= nextMonth;
            default:
              return true;
          }
        } catch (e) {
          return false;
        }
      });
    }
    
    setFilteredAppointments(filtered);
  };

  const updateStatus = async (id, status) => {
    // Prevent double clicks by checking if already processing
    if (processingId) {
      return;
    }
    
    try {
      setProcessingId(id);
      console.log(`Updating appointment ${id} to status: ${status}`);
      
      const response = await updateAppointmentStatus(id, status);
      console.log('Update response:', response);
      
      if (response.data && response.data.success) {
        // Update local state
        setAppointments(prev => prev.map(a => 
          a.id === id ? { ...a, status } : a
        ));
        toast.success(`Appointment marked as ${status}`);
      } else {
        toast.error(response.data?.message || 'Failed to update status');
      }
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setEditFormData({
      appointmentDate: new Date(appointment.appointmentDate),
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingId(editingAppointment.id);
      
      // Format the date properly
      const selectedDate = editFormData.appointmentDate;
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      
      const updateData = {
        appointmentDate: formattedDate,
        notes: editFormData.notes
      };
      
      console.log('Sending reschedule data:', updateData);
      
      const response = await updateAppointmentDateTime(editingAppointment.id, updateData);
      
      if (response.data && response.data.success) {
        toast.success('Appointment rescheduled successfully');
        setShowEditModal(false);
        setEditingAppointment(null);
        fetchAppointments(); // Refresh the list
      } else {
        toast.error(response.data?.message || 'Failed to reschedule appointment');
      }
      
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelClick = (appointment) => {
    setCancellingAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    
    try {
      setProcessingId(cancellingAppointment.id);
      const response = await updateAppointmentStatus(
        cancellingAppointment.id, 
        'CANCELLED', 
        cancellationReason
      );
      
      if (response.data && response.data.success) {
        toast.success('Appointment cancelled successfully');
        setShowCancelModal(false);
        setCancellingAppointment(null);
        setCancellationReason('');
        fetchAppointments(); // Refresh the list
      } else {
        toast.error(response.data?.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <FiAlertCircle className="h-4 w-4" />;
    
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <FiClock className="h-4 w-4" />;
      case 'CANCELLED':
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiAlertCircle className="h-4 w-4" />;
    }
  };

  // Filter time slots (9 AM to 5 PM)
  const filterTime = (time) => {
    const hours = time.getHours();
    return hours >= 9 && hours < 17;
  };

  const exportToCSV = () => {
    try {
      if (!Array.isArray(filteredAppointments) || filteredAppointments.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = ['Child Name', 'Parent Name', 'Doctor', 'Vaccine', 'Appointment Date', 'Status', 'Cancellation Reason'];
      const data = filteredAppointments.map(a => [
        a.child?.name || 'N/A',
        a.child?.parent?.name || 'N/A',
        a.doctor?.name || 'N/A',
        a.vaccine?.name || 'N/A',
        a.appointmentDate ? new Date(a.appointmentDate).toLocaleString() : 'N/A',
        a.status || 'N/A',
        a.cancellationReason || ''
      ]);
      
      const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export data');
    }
  };

  const clearFilters = () => {
    setStatusFilter('pending');
    setDateFilter('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiAlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchAppointments}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiRefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Stats - include cancelled
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient appointments with doctors</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={appointments.length === 0}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FiDownload className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards - include cancelled */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
        </div>
      </div>

      {/* Status Filter Buttons - include cancelled */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'confirmed'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Confirmed ({stats.confirmed})
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'cancelled'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Cancelled ({stats.cancelled})
        </button>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-gray-800 text-white dark:bg-gray-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All ({stats.total})
        </button>
        
        {/* Date Filter Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          <FiFilter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
          </select>
          
          {(statusFilter !== 'pending' || dateFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {Array.isArray(filteredAppointments) && filteredAppointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Child / Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vaccine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Appointment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {appointment.child?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Parent: {appointment.child?.parent?.name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
                          <FiUserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Dr. {appointment.doctor?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {appointment.doctor?.specialization || 'General'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {appointment.vaccine?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {appointment.appointmentDate 
                            ? new Date(appointment.appointmentDate).toLocaleString() 
                            : 'N/A'}
                        </span>
                      </div>
                      {appointment.cancellationReason && appointment.status === 'CANCELLED' && (
                        <div className="mt-1 text-xs text-red-600 dark:text-red-400 max-w-xs">
                          Reason: {appointment.cancellationReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {appointment.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(appointment.id, 'CONFIRMED')}
                            disabled={processingId === appointment.id}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === appointment.id ? 'Processing...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => handleCancelClick(appointment)}
                            disabled={processingId === appointment.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleEditClick(appointment)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
                        >
                          <FiEdit2 className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                      {appointment.status === 'CANCELLED' && (
                        <span className="text-gray-400 text-sm">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-center">
                <FiCalendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No appointments found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {appointments.length === 0 
                    ? "No appointments have been booked yet." 
                    : "Try adjusting your filters."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Appointment
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAppointment(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child
                </label>
                <input
                  type="text"
                  value={editingAppointment.child?.name || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Doctor
                </label>
                <input
                  type="text"
                  value={`Dr. ${editingAppointment.doctor?.name || 'N/A'}`}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vaccine
                </label>
                <input
                  type="text"
                  value={editingAppointment.vaccine?.name || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Date & Time <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={editFormData.appointmentDate}
                  onChange={(date) => {
                    console.log('Edit - selected date:', date);
                    console.log('Edit - hours:', date.getHours());
                    console.log('Edit - minutes:', date.getMinutes());
                    setEditFormData({...editFormData, appointmentDate: date});
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  filterTime={filterTime}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Available: 9:00 AM - 5:00 PM
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAppointment(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === editingAppointment?.id}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === editingAppointment?.id ? (
                    <>
                      <FiRefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Cancel Appointment
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Are you sure you want to cancel this appointment for{' '}
                    <span className="font-semibold">{cancellingAppointment?.child?.name}</span>?
                  </p>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Please provide a reason for cancellation..."
                    required
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancellingAppointment(null);
                      setCancellationReason('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={processingId === cancellingAppointment?.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processingId === cancellingAppointment?.id ? (
                      <>
                        <FiRefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Cancellation'
                    )}
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

export default AllAppointments;