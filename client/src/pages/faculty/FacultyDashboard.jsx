import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { 
  BookOpen, 
  Clock, 
  MapPin, 
  Calendar,
  Briefcase,
  GraduationCap
} from "lucide-react";

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Today's Classes using the endpoint we made earlier
    api.get("/timetable/daily")
      .then((res) => setTodaySchedule(res.data.schedule || []))
      .catch((err) => console.error("Failed to load schedule"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 1. Welcome Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, Prof. {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">
            Department of {user?.departmentId?.name || "Academics"} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. LEFT: Today's Schedule Widget */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-blue-600" /> Today's Classes
          </h2>

          {loading ? (
            <p>Loading schedule...</p>
          ) : todaySchedule.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
              <p className="text-gray-500">No classes scheduled for today. Enjoy your time! ☕</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todaySchedule.map((slot) => (
                <div key={slot._id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{slot.courseOfferingId?.courseId?.name}</h3>
                    <p className="text-gray-500 text-sm font-mono">{slot.courseOfferingId?.courseId?.code}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Clock size={14}/> {slot.startTime} - {slot.endTime}</span>
                      <span className="flex items-center gap-1"><MapPin size={14}/> Room {slot.roomNumber}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/faculty/attendance/${slot.courseOfferingId?._id}`}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-200 transition"
                  >
                    Mark Attendance
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. RIGHT: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-4">Quick Menu</h3>
            <div className="space-y-3">
              <Link to="/faculty/leave" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg backdrop-blur-sm transition">
                <Briefcase size={20} /> Apply for Leave
              </Link>
              <Link to="/faculty/marks" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg backdrop-blur-sm transition">
                <GraduationCap size={20} /> Update Marks
              </Link>
              <Link to="/faculty/courses" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg backdrop-blur-sm transition">
                <BookOpen size={20} /> View All Courses
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;