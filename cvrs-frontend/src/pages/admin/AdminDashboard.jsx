import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiUsers, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiUserCheck,
  FiUserPlus,
  FiActivity,
  FiTrendingUp,
  FiDownload,
  FiFilter,
  FiBox,
  FiEdit2,
  FiXCircle,
  FiShield,
  FiUser,
  FiAward,
  FiBriefcase,
  FiRefreshCw,
  FiBarChart2,
  FiPieChart,
  FiPercent
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { getDashboardStats, getRecentActivities } from '../../services/adminService';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { darkMode, dashboardLayout, loading: themeLoading } = useTheme();
  
  // Check user role
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';
  
  const [stats, setStats] = useState({
    totalParents: 0,
    totalChildren: 0,
    totalDoctors: 0,
    completedVaccinations: 0,
    pendingVaccinations: 0,
    todaySchedules: 0,
    overdueVaccinations: 0,
    totalVaccines: 0,
    totalAppointments: 0,
    // Doctor-specific stats
    myAppointments: 0,
    myPatients: 0,
    myCompletionRate: 0,
    doctorName: '',
    doctorSpecialization: ''
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState('month');
  const [filteredData, setFilteredData] = useState(null);
  const [chartData, setChartData] = useState({
    weekly: [],
    monthly: [],
    distribution: []
  });

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
    
    const interval = setInterval(() => {
      fetchRecentActivities();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterDataByDate();
  }, [selectedDate, dateRange, stats]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();
      console.log('Dashboard stats response:', response);
      
      const data = response.data || response;
      
      // Log each field for debugging
      console.log('Total Parents:', data.totalParents);
      console.log('Total Children:', data.totalChildren);
      console.log('Total Doctors:', data.totalDoctors);
      console.log('Completed Vaccinations:', data.completedVaccinations);
      console.log('Pending Vaccinations:', data.pendingVaccinations);
      console.log('Today Schedules:', data.todaySchedules);
      console.log('Overdue Vaccinations:', data.overdueVaccinations);
      console.log('Weekly Stats:', data.weeklyStats);
      console.log('Monthly Stats:', data.monthlyStats);
      console.log('Distribution Stats:', data.distributionStats);
      
      setStats({
        totalParents: data.totalParents || 0,
        totalChildren: data.totalChildren || 0,
        totalDoctors: data.totalDoctors || 0,
        completedVaccinations: data.completedVaccinations || 0,
        pendingVaccinations: data.pendingVaccinations || 0,
        todaySchedules: data.todaySchedules || 0,
        overdueVaccinations: data.overdueVaccinations || 0,
        totalVaccines: data.totalVaccines || 0,
        totalAppointments: data.totalAppointments || 0,
        // Doctor-specific stats
        myAppointments: data.myAppointments || 0,
        myPatients: data.myPatients || 0,
        myCompletionRate: data.myCompletionRate || 0,
        doctorName: data.doctorName || user?.name || '',
        doctorSpecialization: data.doctorSpecialization || user?.specialization || 'General Physician'
      });
      
      setChartData({
        weekly: data.weeklyStats || generateWeeklyData(),
        monthly: data.monthlyStats || generateMonthlyData(),
        distribution: data.distributionStats || generateDistributionData(data)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await getRecentActivities();
      
      let activitiesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          activitiesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          activitiesData = response.data.data;
        } else if (response.data.activities && Array.isArray(response.data.activities)) {
          activitiesData = response.data.activities;
        }
      }
      
      // Ensure each activity has a unique ID
      activitiesData = activitiesData.map((activity, index) => ({
        ...activity,
        uniqueId: activity.id 
          ? `${activity.id}-${index}-${Date.now()}`
          : `activity-${Date.now()}-${index}-${Math.random()}`
      }));
      
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  // Generate fallback data only if API fails
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      vaccinations: 0,
      appointments: 0,
      completed: 0
    }));
  };

  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      vaccinations: 0,
      parents: 0,
      children: 0
    }));
  };

  const generateDistributionData = (stats) => [
    { name: 'Completed', value: stats.completedVaccinations || 0 },
    { name: 'Pending', value: stats.pendingVaccinations || 0 },
    { name: 'Overdue', value: stats.overdueVaccinations || 0 }
  ];

  const filterDataByDate = () => {
    let filtered = { ...stats };
    
    const multipliers = {
      day: 0.1,
      week: 0.3,
      month: 0.8,
      year: 1
    };
    
    const multiplier = multipliers[dateRange] || 1;
    
    filtered = {
      ...stats,
      completedVaccinations: Math.floor(stats.completedVaccinations * multiplier),
      pendingVaccinations: Math.floor(stats.pendingVaccinations * multiplier)
    };
    
    setFilteredData(filtered);
  };

  // Calculate success rate
  const calculateSuccessRate = () => {
    const total = stats.completedVaccinations + stats.pendingVaccinations;
    if (total === 0) return 0;
    return Math.round((stats.completedVaccinations / total) * 100);
  };

  // ==================== DEFAULT LAYOUT ====================
  const renderDefaultLayout = () => (
    <div className="space-y-6">
      {/* Header with Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome, {isDoctor ? `Dr. ${user?.name}` : user?.name}
            </h1>
            <p className="opacity-90 flex items-center gap-2">
              {isDoctor ? (
                <>
                  <FiBriefcase className="h-4 w-4" />
                  {stats.doctorSpecialization} • {stats.myPatients} patients
                </>
              ) : (
                <>
                  <FiShield className="h-4 w-4" />
                  System Administrator
                </>
              )}
            </p>
          </div>
          <div className={`p-3 rounded-full ${isDoctor ? 'bg-blue-500/30' : 'bg-purple-500/30'}`}>
            {isDoctor ? <FiUserCheck className="h-8 w-8" /> : <FiShield className="h-8 w-8" />}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* For Doctors - Show My Appointments */}
        {isDoctor ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-my-appointments">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">My Appointments</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.myAppointments}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <FiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">{stats.todaySchedules} today</p>
          </div>
        ) : (
          /* For Admins - Show Total Parents */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-total-parents">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Parents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData?.totalParents || stats.totalParents}</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
                <FiUsers className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>
        )}

        {/* For Doctors - Show My Patients */}
        {isDoctor ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-my-patients">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">My Patients</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.myPatients}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <FiUsers className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        ) : (
          /* For Admins - Show Total Children */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-total-children">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Children</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData?.totalChildren || stats.totalChildren}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <FiUserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* For Doctors - Show Completion Rate */}
        {isDoctor ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-completion-rate">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.myCompletionRate}%</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <FiTrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        ) : (
          /* For Admins - Show Total Doctors */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-total-doctors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDoctors}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <FiUserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Today's Schedule - Common for both */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-today-schedule">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Schedule</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.todaySchedules}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{selectedDate.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Vaccination Stats - Common for both */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-completed">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{filteredData?.completedVaccinations || stats.completedVaccinations}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-pending">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{filteredData?.pendingVaccinations || stats.pendingVaccinations}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="stat-overdue">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="chart-weekly">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isDoctor ? 'My Weekly Appointments' : 'Weekly Vaccinations'}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                />
                <Bar dataKey={isDoctor ? "appointments" : "vaccinations"} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                {!isDoctor && <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="chart-distribution">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isDoctor ? 'Patient Age Distribution' : 'Monthly Trend'}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {isDoctor ? (
                <PieChart>
                  <Pie
                    data={[
                      { name: '0-2 years', value: stats.myPatients ? Math.floor(stats.myPatients * 0.3) : 0 },
                      { name: '2-5 years', value: stats.myPatients ? Math.floor(stats.myPatients * 0.45) : 0 },
                      { name: '5+ years', value: stats.myPatients ? Math.floor(stats.myPatients * 0.25) : 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {[0,1,2].map((index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <LineChart data={chartData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: darkMode ? '#f9fafb' : '#111827'
                    }}
                  />
                  <Line type="monotone" dataKey="vaccinations" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="children" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution - Common for both */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="status-distribution">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  {chartData.distribution.map((entry, index) => (
                    <Cell key={`dist-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity - Common for both */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" key="recent-activity">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">Live updates every 30s</span>
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {recentActivities.map((activity) => (
                <div key={activity.uniqueId} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    activity.type === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.type === 'edit' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.type === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30' :
                    activity.type === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {activity.icon ? (
                      <span className="text-sm">{activity.icon}</span>
                    ) : (
                      activity.type === 'pending' ? <FiClock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> :
                      activity.type === 'confirmed' ? <FiCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                      activity.type === 'edit' ? <FiEdit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                      activity.type === 'cancelled' ? <FiXCircle className="h-4 w-4 text-red-600 dark:text-red-400" /> :
                      activity.type === 'completed' ? <FiCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                      <FiActivity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                  {activity.type === 'pending' && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <FiActivity className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No recent activities</p>
              <p className="text-xs mt-1">Activities will appear here when users interact with the system</p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/admin/appointments" 
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center justify-center gap-1"
            >
              View all appointments
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== ANALYTICS LAYOUT ====================
  const renderAnalyticsLayout = () => (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time system analytics and insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setDateRange('day')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === 'day' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === 'week' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === 'month' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === 'year' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Year
              </button>
            </div>
            
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Filtered Stats Summary */}
        {filteredData && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed in period</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{filteredData.completedVaccinations || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending in period</p>
              <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{filteredData.pendingVaccinations || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Parents</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.totalParents}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Children</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{stats.totalChildren}</p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Parents</p>
              <p className="text-2xl font-bold mt-1">{stats.totalParents}</p>
            </div>
            <FiUsers className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Children</p>
              <p className="text-2xl font-bold mt-1">{stats.totalChildren}</p>
            </div>
            <FiUserCheck className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Doctors</p>
              <p className="text-2xl font-bold mt-1">{stats.totalDoctors}</p>
            </div>
            <FiUserPlus className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Success Rate</p>
              <p className="text-2xl font-bold mt-1">{calculateSuccessRate()}%</p>
            </div>
            <FiPercent className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="vaccinations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.monthly}>
                <defs>
                  <linearGradient id="colorVaccinations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area type="monotone" dataKey="vaccinations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVaccinations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointment Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats.completedVaccinations },
                    { name: 'Pending', value: stats.pendingVaccinations },
                    { name: 'Overdue', value: stats.overdueVaccinations }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  {[0,1,2].map((index) => (
                    <Cell key={`analytics-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivities.slice(0, 8).map((activity) => (
              <div key={activity.uniqueId} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className={`h-2 w-2 mt-2 rounded-full ${
                  activity.type === 'pending' ? 'bg-yellow-500' :
                  activity.type === 'confirmed' ? 'bg-green-500' :
                  activity.type === 'cancelled' ? 'bg-red-500' :
                  activity.type === 'completed' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.totalParents}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Parents</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalChildren}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Children</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalDoctors}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Doctors</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.todaySchedules}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Today's Schedule</p>
        </div>
      </div>
    </div>
  );

  // ==================== COMPACT LAYOUT ====================
  const renderCompactLayout = () => (
    <div className="space-y-4">
      {/* Date Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
        <div className="flex items-center gap-3">
          <FiFilter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDateRange('day')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                dateRange === 'day' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                dateRange === 'week' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                dateRange === 'month' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                dateRange === 'year' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Year
            </button>
          </div>
          <div className="ml-auto">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
              <FiUsers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Parents</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredData?.totalParents || stats.totalParents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <FiUserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Children</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredData?.totalChildren || stats.totalChildren}</p>
            </div>
          </div>
        </div>
        
        {/* Only show Doctors stat to Admin users */}
        {isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <FiUserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Doctors</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalDoctors}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.todaySchedules}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vaccination Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{filteredData?.completedVaccinations || stats.completedVaccinations}</p>
            </div>
            <FiCheckCircle className="h-8 w-8 text-green-500 dark:text-green-400 opacity-80" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{filteredData?.pendingVaccinations || stats.pendingVaccinations}</p>
            </div>
            <FiClock className="h-8 w-8 text-yellow-500 dark:text-yellow-400 opacity-80" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdueVaccinations}</p>
            </div>
            <FiAlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* Compact Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Weekly Progress</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.weekly}>
                <Line type="monotone" dataKey="vaccinations" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    padding: '4px 8px'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Activity</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.uniqueId} className="flex items-center gap-2 text-xs">
                <div className={`h-1.5 w-1.5 rounded-full ${
                  activity.type === 'pending' ? 'bg-yellow-500' :
                  activity.type === 'confirmed' ? 'bg-green-500' :
                  activity.type === 'edit' ? 'bg-blue-500' :
                  activity.type === 'cancelled' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{activity.action}</span>
                <span className="text-gray-400 dark:text-gray-500 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Rate Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Success Rate</p>
            <p className="text-2xl font-bold">{calculateSuccessRate()}%</p>
          </div>
          <FiPercent className="h-8 w-8 opacity-80" />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="bg-white/20 px-2 py-1 rounded">Based on completed vs pending</span>
        </div>
      </div>
    </div>
  );

  // If theme is still loading, show minimal loading
  if (themeLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  // Render based on selected layout
  const renderLayout = () => {
    console.log('Rendering layout:', dashboardLayout);
    
    switch(dashboardLayout) {
      case 'analytics':
        return renderAnalyticsLayout();
      case 'compact':
        return renderCompactLayout();
      case 'default':
      default:
        return renderDefaultLayout();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
          onClick={fetchDashboardData}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiRefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderLayout()}
    </div>
  );
};

export default AdminDashboard;