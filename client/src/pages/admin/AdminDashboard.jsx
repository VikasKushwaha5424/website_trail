import { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Megaphone, 
  CreditCard, 
  RefreshCw 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    activeSemester: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Define Fetch Logic (Wrapped in useCallback for dependency stability)
  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const { data } = await api.get('/admin/stats');
      if (data.success) {
        setStats(data.stats);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
      // Only set error on initial load, not during background refreshes
      if (!isRefresh) setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 2. Lifecycle: Initial Fetch + Auto-Polling
  useEffect(() => {
    fetchStats(); // Initial load

    // Poll every 30 seconds to keep data fresh
    const interval = setInterval(() => {
      fetchStats(true); // Background refresh
    }, 30000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchStats]);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* 3. Welcome Section */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="mt-2 opacity-90">Here is what's happening in your institute today.</p>
        </div>
        
        <div className="text-right flex flex-col items-end gap-2">
          <p className="text-sm uppercase tracking-wider opacity-75 hidden md:block">Administrator</p>
          
          {/* Manual Refresh Button */}
          <button 
            onClick={() => fetchStats(true)} 
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-all border border-white/30"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Updating..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* 4. Stats Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          count={stats.totalStudents} 
          icon={<Users className="w-8 h-8 text-blue-600" />} 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Total Faculty" 
          count={stats.totalFaculty} 
          icon={<GraduationCap className="w-8 h-8 text-green-600" />} 
          bgColor="bg-green-50" 
        />
        <StatCard 
          title="Total Courses" 
          count={stats.totalCourses} 
          icon={<BookOpen className="w-8 h-8 text-purple-600" />} 
          bgColor="bg-purple-50" 
        />

        <div className="bg-orange-50 p-6 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Active Semester</p>
            <h3 className="text-xl font-bold text-gray-800 mt-1">
              {stats.activeSemester ? stats.activeSemester.name : "None Active"}
            </h3>
            {stats.activeSemester && (
              <span className="text-xs text-orange-600 font-semibold bg-orange-200 px-2 py-1 rounded mt-2 inline-block">
                {stats.activeSemester.code}
              </span>
            )}
          </div>
          <div className="p-3 bg-white rounded-full shadow-sm">
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* 5. Quick Actions Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionButton 
            onClick={() => navigate('/admin/notices')} 
            icon={<Megaphone className="w-6 h-6 text-indigo-600 group-hover:text-white" />} 
            color="indigo" 
            title="Broadcast Notice" 
            desc="Send alerts to everyone" 
          />
          <ActionButton 
            onClick={() => navigate('/admin/fees')} 
            icon={<CreditCard className="w-6 h-6 text-emerald-600 group-hover:text-white" />} 
            color="emerald" 
            title="Verify Payments" 
            desc="Approve fee transactions" 
          />
          <ActionButton 
            onClick={() => navigate('/admin/users')} 
            icon={<Users className="w-6 h-6 text-gray-700 group-hover:text-white" />} 
            color="gray" 
            title="Manage Users" 
            desc="Add or remove accounts" 
          />
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ title, count, icon, bgColor }) => (
  <div className={`${bgColor} p-6 rounded-xl shadow-sm border border-opacity-50 border-gray-200 flex items-center justify-between`}>
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{count}</h3>
    </div>
    <div className="p-3 bg-white rounded-full shadow-sm">{icon}</div>
  </div>
);

const ActionButton = ({ onClick, icon, color, title, desc }) => (
  <button onClick={onClick} className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group text-left w-full">
    <div className={`p-3 bg-${color}-100 rounded-full group-hover:bg-${color}-600 transition-colors`}>
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </button>
);

export default AdminDashboard;