import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChildren, getChildSchedule } from '../../services/childService';
import { 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiPlus, 
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const ParentDashboard = () => {
  const { dashboardLayout } = useTheme();
  const [children, setChildren] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    completedVaccinations: 0,
    pendingVaccinations: 0,
    upcomingThisWeek: 0,
    overdueVaccinations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const childrenResponse = await getChildren();
        const childrenData = Array.isArray(childrenResponse?.data) ? childrenResponse.data : [];
        
        if (!isMounted) return;
        setChildren(childrenData);
        
        let completed = 0;
        let pending = 0;
        let overdue = 0;
        let upcomingThisWeek = 0;
        let allSchedules = [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        if (childrenData.length > 0) {
          for (const child of childrenData) {
            if (!child || !child.id) continue;
            
            try {
              const scheduleResponse = await getChildSchedule(child.id);
              const childSchedules = Array.isArray(scheduleResponse?.data) ? scheduleResponse.data : [];
              
              if (childSchedules.length > 0) {
                allSchedules = [...allSchedules, ...childSchedules];
                
                childSchedules.forEach(schedule => {
                  if (!schedule || !schedule.dueDate) return;
                  
                  const dueDate = new Date(schedule.dueDate);
                  dueDate.setHours(0, 0, 0, 0);
                  
                  if (schedule.status === 'COMPLETED') {
                    completed++;
                  } else if (schedule.status === 'PENDING' || schedule.status === 'OVERDUE') {
                    pending++;
                    
                    if (dueDate < today || schedule.status === 'OVERDUE') {
                      overdue++;
                    }
                    
                    if (dueDate >= today && dueDate <= nextWeek) {
                      upcomingThisWeek++;
                    }
                  }
                });
              }
            } catch (err) {
              console.error(`Error fetching schedule for child ${child.id}:`, err);
            }
          }
        }
        
        if (!isMounted) return;
        
        const upcoming = Array.isArray(allSchedules) 
          ? allSchedules
              .filter(s => s && (s.status === 'PENDING' || s.status === 'OVERDUE'))
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .slice(0, 5)
          : [];
        
        setUpcomingVaccinations(upcoming);
        
        setStats({
          totalChildren: childrenData.length,
          completedVaccinations: completed,
          pendingVaccinations: pending,
          upcomingThisWeek,
          overdueVaccinations: overdue
        });
        
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again.');
          toast.error('Failed to load dashboard data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => { isMounted = false; };
  }, []);

  const chartData = [
    { month: 'Jan', vaccinations: 4 },
    { month: 'Feb', vaccinations: 6 },
    { month: 'Mar', vaccinations: 8 },
    { month: 'Apr', vaccinations: 7 },
    { month: 'May', vaccinations: 9 },
    { month: 'Jun', vaccinations: 11 },
  ];

  const getStatusBadge = (status, dueDate) => {
    if (!status || !dueDate) return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full">Unknown</span>;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    if (status === 'COMPLETED') {
      return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">Completed</span>;
    } else if (status === 'OVERDUE' || due < today) {
      return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs rounded-full">Overdue</span>;
    } else {
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded-full">Due in {diffDays} days</span>;
      } else {
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">Pending</span>;
      }
    }
  };

  // ==================== DEFAULT LAYOUT (Unchanged) ====================
  const renderDefaultLayout = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Here's your children's vaccination status.</p>
        </div>
        <Link
          to="/parent/add-child"
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          Add New Child
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Children</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalChildren}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
              <FiUsers className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedVaccinations}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingVaccinations}</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <FiClock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Due This Week</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.upcomingThisWeek}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdueVaccinations}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Children List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vaccination Progress</h2>
          {stats.totalChildren > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line type="monotone" dataKey="vaccinations" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-center">
                <FiCheckCircle className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p>No vaccination data yet</p>
                <p className="text-sm mt-1">Complete vaccinations to see progress</p>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Children</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/parent/child/${child.id}/schedule`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{child.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      DOB: {new Date(child.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 text-sm font-medium">View →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Vaccinations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Vaccinations</h2>
          <Link to="/parent/children" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
            View All Children
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Child Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vaccine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingVaccinations.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {schedule.child?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {schedule.vaccine?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {schedule.dueDate ? new Date(schedule.dueDate).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(schedule.status, schedule.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {schedule.child?.id ? (
                      <Link
                        to={`/parent/child/${schedule.child.id}/schedule`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 font-medium"
                      >
                        View Schedule
                      </Link>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">No child</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {upcomingVaccinations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FiCheckCircle className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                    <p>No upcoming vaccinations</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {upcomingVaccinations.length > 0 && (
          <div className="mt-4 text-center">
            <Link
              to="/parent/children"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              View All Upcoming Vaccinations
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  // ==================== MODERN GLASS LAYOUT ====================
  const renderModernGlassLayout = () => (
    <div className="space-y-6">
      {/* Glass header */}
      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-300">Here's your vaccination summary</p>
          </div>
          <Link
            to="/parent/add-child"
            className="backdrop-blur-md bg-white/40 dark:bg-gray-700/40 hover:bg-white/60 dark:hover:bg-gray-600/60 text-gray-800 dark:text-white px-6 py-3 rounded-xl transition-all border border-white/30 dark:border-gray-600/30 flex items-center gap-2"
          >
            <FiPlus className="h-5 w-5" />
            Add Child
          </Link>
        </div>
      </div>

      {/* Glass stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Children</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalChildren}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-sm flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.completedVaccinations}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100/50 dark:bg-green-900/30 backdrop-blur-sm flex items-center justify-center">
              <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.pendingVaccinations}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100/50 dark:bg-yellow-900/30 backdrop-blur-sm flex items-center justify-center">
              <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-800/40 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Overdue</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.overdueVaccinations}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100/50 dark:bg-red-900/30 backdrop-blur-sm flex items-center justify-center">
              <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Glass chart and children section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Vaccination Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line type="monotone" dataKey="vaccinations" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Children</h2>
          <div className="space-y-3">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/parent/child/${child.id}/schedule`}
                className="block p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all border border-white/30 dark:border-gray-600/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{child.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      DOB: {new Date(child.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-primary-600 dark:text-primary-400">→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Glass upcoming vaccinations */}
      <div className="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Vaccinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingVaccinations.map((schedule) => (
            <div key={schedule.id} className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-white/30 dark:border-gray-600/30">
              <p className="font-medium text-gray-800 dark:text-white">{schedule.child?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{schedule.vaccine?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Due: {new Date(schedule.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== BOLD GRADIENT LAYOUT ====================
  const renderBoldGradientLayout = () => (
    <div className="space-y-6">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-800 dark:via-pink-800 dark:to-orange-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="opacity-90">Track your family's vaccination journey</p>
          </div>
          <Link
            to="/parent/add-child"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <FiPlus className="h-5 w-5" />
            Add Child
          </Link>
        </div>
      </div>

      {/* Gradient stats cards with progress bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-700 dark:to-cyan-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Total Children</p>
          <p className="text-4xl font-bold mt-2">{stats.totalChildren}</p>
          <div className="mt-4 h-2 w-full bg-white/30 rounded-full">
            <div className="h-2 w-full bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-700 dark:to-emerald-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Completed</p>
          <p className="text-4xl font-bold mt-2">{stats.completedVaccinations}</p>
          <div className="mt-4 h-2 w-full bg-white/30 rounded-full">
            <div className="h-2 w-3/4 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-700 dark:to-orange-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-4xl font-bold mt-2">{stats.pendingVaccinations}</p>
          <div className="mt-4 h-2 w-full bg-white/30 rounded-full">
            <div className="h-2 w-1/2 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-pink-500 dark:from-red-700 dark:to-pink-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Overdue</p>
          <p className="text-4xl font-bold mt-2">{stats.overdueVaccinations}</p>
          <div className="mt-4 h-2 w-full bg-white/30 rounded-full">
            <div className="h-2 w-1/4 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Gradient chart area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-700 rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Monthly Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.8)" />
                <YAxis stroke="rgba(255,255,255,0.8)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                />
                <Line type="monotone" dataKey="vaccinations" stroke="white" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Your Children</h2>
          <div className="space-y-3">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/parent/child/${child.id}/schedule`}
                className="block p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{child.name}</h3>
                    <p className="text-sm opacity-80">
                      DOB: {new Date(child.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-white">→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient activity feed */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-700 dark:to-teal-700 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-3">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
            <FiCheckCircle className="h-5 w-5" />
            <span>{stats.completedVaccinations} vaccinations completed</span>
          </div>
          <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
            <FiClock className="h-5 w-5" />
            <span>{stats.upcomingThisWeek} upcoming this week</span>
          </div>
          <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3">
            <FiAlertCircle className="h-5 w-5" />
            <span>{stats.overdueVaccinations} overdue</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== CARD STACK LAYOUT ====================
  const renderCardStackLayout = () => (
    <div className="space-y-8">
      {/* Header card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Track and manage vaccinations</p>
          </div>
          <Link
            to="/parent/add-child"
            className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <FiPlus className="h-5 w-5" />
            Add Child
          </Link>
        </div>
      </div>

      {/* Stacked stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Children Card with stack effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform"></div>
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-750 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Children</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalChildren}</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl">
                <FiUsers className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Completed Card with stack effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-green-200 dark:bg-green-900/50 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform"></div>
          <div className="absolute inset-0 bg-green-100 dark:bg-green-800/30 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completedVaccinations}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Card with stack effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-yellow-200 dark:bg-yellow-900/50 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform"></div>
          <div className="absolute inset-0 bg-yellow-100 dark:bg-yellow-800/30 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pendingVaccinations}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
                <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Card with stack effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-red-200 dark:bg-red-900/50 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform"></div>
          <div className="absolute inset-0 bg-red-100 dark:bg-red-800/30 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.overdueVaccinations}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with stacked cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart card with stack effect */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform"></div>
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-750 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Vaccination Progress</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="vaccinations" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Children list card with stack effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform"></div>
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-750 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Children</h2>
            <div className="space-y-3">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={`/parent/child/${child.id}/schedule`}
                  className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{child.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        DOB: {new Date(child.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-primary-600 dark:text-primary-400">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stacked upcoming vaccinations */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl transform rotate-1 translate-y-1 group-hover:rotate-2 transition-transform"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Vaccinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingVaccinations.map((schedule) => (
              <div key={schedule.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="font-medium text-gray-900 dark:text-white">{schedule.child?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{schedule.vaccine?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Due: {new Date(schedule.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER BASED ON SELECTED LAYOUT ====================
  const renderLayout = () => {
    switch(dashboardLayout) {
      case 'analytics':
        return renderModernGlassLayout();
      case 'compact':
        return renderBoldGradientLayout();
      case 'bold-gradient':
        return renderCardStackLayout();
      default:
        return renderDefaultLayout();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FiAlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Empty state (no children)
  if (stats.totalChildren === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome to CVRS! Get started by adding your first child.</p>
          </div>
          <Link
            to="/parent/add-child"
            className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <FiPlus className="h-5 w-5" />
            Add New Child
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-6 rounded-full">
              <FiUsers className="h-16 w-16 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to CVRS!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            You haven't added any children yet. Add your first child to start tracking their vaccination schedule and receive timely reminders.
          </p>
          <Link
            to="/parent/add-child"
            className="inline-flex items-center gap-2 bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <FiPlus className="h-5 w-5" />
            Add Your First Child
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Add Children</h3>
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              Add your children's details including name, date of birth, and gender.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="bg-green-100 dark:bg-green-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FiCalendar className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">Track Schedules</h3>
            <p className="text-green-700 dark:text-green-400 text-sm">
              View upcoming vaccinations and mark them as completed when done.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="bg-yellow-100 dark:bg-yellow-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Get Reminders</h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Receive notifications for upcoming and overdue vaccinations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render the selected layout
  return renderLayout();
};

export default ParentDashboard;