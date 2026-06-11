import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChildById, getChildSchedule, markVaccinationComplete } from '../../services/childService';
import { FiArrowLeft, FiCheckCircle, FiClock, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ChildSchedule = () => {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const childResponse = await getChildById(id);
      setChild(childResponse.data);
      
      const scheduleResponse = await getChildSchedule(id);
      setSchedules(scheduleResponse.data || []);
    } catch (error) {
      toast.error('Failed to load schedule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (scheduleId) => {
    try {
      setProcessingId(scheduleId);
      await markVaccinationComplete(scheduleId);
      toast.success('Vaccination marked as completed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to mark as completed');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'all') return true;
    return schedule.status?.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <FiCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'PENDING':
        return <FiClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <FiAlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Child not found</p>
        <Link to="/parent/children" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mt-4 inline-block">
          Back to Children List
        </Link>
      </div>
    );
  }

  const stats = {
    total: schedules.length,
    completed: schedules.filter(s => s.status === 'COMPLETED').length,
    pending: schedules.filter(s => s.status === 'PENDING').length,
    overdue: schedules.filter(s => s.status === 'PENDING' && isOverdue(s.dueDate)).length
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/parent/children"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Children
      </Link>

      {/* Child Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{child.name}'s Vaccination Schedule</h1>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p>Date of Birth: {new Date(child.dob).toLocaleDateString()}</p>
              <p>Gender: {child.gender}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            {stats.overdue > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'completed'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === filterOption
                ? 'bg-primary-600 dark:bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vaccine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
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
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold">
                          {schedule.vaccine?.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {schedule.vaccine?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Due at {schedule.vaccine?.ageInMonths} months
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FiCalendar className={`h-4 w-4 ${
                        isOverdue(schedule.dueDate) && schedule.status === 'PENDING' 
                          ? 'text-red-500 dark:text-red-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        isOverdue(schedule.dueDate) && schedule.status === 'PENDING' 
                          ? 'text-red-600 dark:text-red-400 font-medium' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {new Date(schedule.dueDate).toLocaleDateString()}
                        {isOverdue(schedule.dueDate) && schedule.status === 'PENDING' && (
                          <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Overdue)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(schedule.status)}`}>
                      {getStatusIcon(schedule.status)}
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {schedule.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkComplete(schedule.id)}
                        disabled={processingId === schedule.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {processingId === schedule.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiCheckCircle className="h-4 w-4" />
                            Mark Completed
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <FiCalendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No schedules found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">There are no {filter === 'all' ? '' : filter} vaccinations for this child.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChildSchedule;