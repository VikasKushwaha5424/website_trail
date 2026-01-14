import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api'; // Your Axios instance
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Megaphone, 
  CreditCard 
} from 'lucide-react'; // Optional: Install lucide-react for icons, or remove them

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 1. State for Dashboard Data
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    activeSemester: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch Data on Mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Matches your backend route: router.get("/stats", ...)
        const { data } = await api.get('/admin/stats');
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <div className="text-right hidden md:block">
          <p className="text-sm uppercase tracking-wider opacity-75">Current Role</p>
          <p className="font-semibold text-lg">Administrator</p>
        </div>
      </div>

      {/* 4. Stats Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Widget 1: Total Students */}
        <StatCard 
          title="Total Students" 
          count={stats.totalStudents} 
          icon={<Users className="w-8 h-8 text-blue-600" />}
          bgColor="bg-blue-50"
        />

        {/* Widget 2: Total Faculty */}
        <StatCard 
          title="Total Faculty" 
          count={stats.totalFaculty} 
          icon={<GraduationCap className="w-8 h-8 text-green-600" />}
          bgColor="bg-green-50"
        />

        {/* Widget 3: Courses */}
        <StatCard 
          title="Total Courses" 
          count={stats.totalCourses} 
          icon={<BookOpen className="w-8 h-8 text-purple-600" />}
          bgColor="bg-purple-50"
        />

        {/* Widget 4: Active Semester */}
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
          
          {/* Action A: Broadcast Notice */}
          <button 
            onClick={() => navigate('/admin/notices')} // Assumes you have this route
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-600 transition-colors">
              <Megaphone className="w-6 h-6 text-indigo-600 group-hover:text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Broadcast Notice</h3>
              <p className="text-sm text-gray-500">Send alerts to students & faculty</p>
            </div>
          </button>

          {/* Action B: Verify Payments */}
          <button 
            onClick={() => navigate('/admin/fees')} // Assumes you have this route
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-600 transition-colors">
              <CreditCard className="w-6 h-6 text-emerald-600 group-hover:text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Verify Payments</h3>
              <p className="text-sm text-gray-500">Approve offline fee transactions</p>
            </div>
          </button>

          {/* Action C: Add User (Optional Extra) */}
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-800 transition-colors">
              <Users className="w-6 h-6 text-gray-700 group-hover:text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Manage Users</h3>
              <p className="text-sm text-gray-500">Add or remove accounts</p>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};

// Helper Component for the Cards
const StatCard = ({ title, count, icon, bgColor }) => (
  <div className={`${bgColor} p-6 rounded-xl shadow-sm border border-opacity-50 border-gray-200 flex items-center justify-between`}>
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{count}</h3>
    </div>
    <div className="p-3 bg-white rounded-full shadow-sm">
      {icon}
    </div>
  </div>
);

export default AdminDashboard;