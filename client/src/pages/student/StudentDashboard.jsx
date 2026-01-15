import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertCircle, 
  Bell, 
  X,
  Home // Optional: You can use this icon instead of the SVG if you prefer
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Data States
  const [notices, setNotices] = useState([]);
  const [dailySchedule, setDailySchedule] = useState(null); 
  const [attendance, setAttendance] = useState(null);
  
  // 1️⃣ NEW STATE: Store student profile to check residency status
  const [studentProfile, setStudentProfile] = useState(null); 

  const [loading, setLoading] = useState(true);

  // 🔔 NOTIFICATION STATE
  const [newNotice, setNewNotice] = useState(null);
  const socket = useSocket();

  // Helper: Time Formatter
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  // 1. Fetch Initial Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const noticesRes = await api.get("/student/announcements");
        setNotices(noticesRes.data);

        const scheduleRes = await api.get("/timetable/daily");
        setDailySchedule(scheduleRes.data);

        const attendanceRes = await api.get("/student/attendance");
        setAttendance(attendanceRes.data);

        // 2️⃣ NEW FETCH: Get Profile Data for Hostel Info
        const profileRes = await api.get("/student/profile");
        setStudentProfile(profileRes.data);

      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. 🔌 REAL-TIME LISTENER
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_notice", (data) => {
      console.log("🔔 New Notice Received:", data);
      setNewNotice(data); 
      setNotices((prev) => [data, ...prev]); 
      setTimeout(() => setNewNotice(null), 5000);
    });

    return () => {
      socket.off("receive_notice");
    };
  }, [socket]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  // Calculate Attendance Colors
  const attPercentage = parseFloat(attendance?.attendancePercentage || 0);
  const attColor = attPercentage >= 75 ? "text-green-600" : attPercentage >= 60 ? "text-orange-500" : "text-red-600";
  const attBg = attPercentage >= 75 ? "bg-green-100" : attPercentage >= 60 ? "bg-orange-100" : "bg-red-100";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 relative">
      
      {/* 🔔 REAL-TIME TOAST NOTIFICATION POPUP */}
      {newNotice && (
        <div className="fixed top-20 right-5 bg-white border-l-4 border-blue-500 shadow-2xl rounded-lg p-4 z-50 w-80 animate-bounce md:animate-none transition-all duration-300 transform translate-x-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">New Announcement!</h4>
                <p className="text-xs text-gray-500">{newNotice.time || "Just now"}</p>
              </div>
            </div>
            <button onClick={() => setNewNotice(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="mt-2">
            <p className="font-semibold text-gray-800">{newNotice.title}</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{newNotice.message}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="mt-4 sm:mt-0 text-left sm:text-right">
          <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Today is</p>
          <p className="text-2xl font-bold text-blue-600">{dailySchedule?.day || "..."}</p>
        </div>
      </header>

      {/* 📊 KEY METRICS SECTION */}
      {/* Added 'md:grid-cols-4' effectively if you want 4 items in a row, but keeping 'md:grid-cols-3' is fine; it will just wrap to the next line. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Attendance Widget */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 font-medium mb-1">Overall Attendance</h3>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${attColor}`}>{attPercentage}%</span>
              <span className={`text-xs px-2 py-1 rounded-full font-bold mb-1 ${attBg} ${attColor}`}>
                {attPercentage >= 75 ? "Good" : "Low"}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-600">
             <div>
                <span className="block font-bold text-gray-800">{attendance?.totalClasses || 0}</span>
                <span className="text-xs">Total Classes</span>
             </div>
             <div>
                <span className="block font-bold text-green-600">{attendance?.presentClasses || 0}</span>
                <span className="text-xs">Present</span>
             </div>
             <div>
                <span className="block font-bold text-red-500">{attendance?.absentClasses || 0}</span>
                <span className="text-xs">Absent</span>
             </div>
          </div>
        </div>

        {/* 2. Quick Actions */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
                <h3 className="text-blue-100 font-medium mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/student/fees" className="bg-white/20 hover:bg-white/30 p-2 rounded text-center text-sm transition">
                        Pay Fees
                    </Link>
                    <Link to="/student/results" className="bg-white/20 hover:bg-white/30 p-2 rounded text-center text-sm transition">
                        View Results
                    </Link>
                    <Link to="/student/courses" className="bg-white/20 hover:bg-white/30 p-2 rounded text-center text-sm transition">
                        My Resources
                    </Link>
                    <Link to="/student/id-card" className="bg-white/20 hover:bg-white/30 p-2 rounded text-center text-sm transition">
                        ID Card
                    </Link>
                </div>
            </div>
        </div>

        {/* 3. Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-center">
            <div>
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar size={24} />
                </div>
                <h3 className="text-gray-800 font-bold">Active Semester</h3>
                <p className="text-gray-500 text-sm mt-1">Check your elective choices</p>
                <Link to="/student/electives" className="text-purple-600 font-medium text-sm mt-2 block hover:underline">
                    Manage Electives
                </Link>
            </div>
        </div>

        {/* 4️⃣ NEW: Hostel Details (Only for Hostellers) */}
        {studentProfile?.residencyType === "HOSTELLER" && studentProfile.hostelDetails && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Home size={20} />
                </div>
                <h3 className="text-indigo-100 font-medium">My Hostel</h3>
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold">{studentProfile.hostelDetails.roomNumber}</p>
                <p className="text-sm opacity-90">{studentProfile.hostelDetails.hostelName}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="text-xs text-indigo-200">
                Residency: <span className="font-bold text-white">Confirmed</span>
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 📅 SECTION 2: TODAY'S SCHEDULE */}
      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          📅 Today's Schedule
        </h2>
        
        {!dailySchedule?.schedule || dailySchedule.schedule.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-400 font-medium">No classes scheduled for today. Enjoy your day! 🎉</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dailySchedule.schedule.map((slot) => (
              <div key={slot._id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center transition hover:shadow-md">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{slot.courseOfferingId?.courseId?.code}</h3>
                  <p className="text-sm text-gray-600 font-medium">{slot.courseOfferingId?.courseId?.name}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    📍 Room: {slot.roomNumber}
                  </p>
                </div>
                <div className="text-right pl-4">
                  <p className="text-lg font-bold text-green-700 whitespace-nowrap">{formatTime(slot.startTime)}</p>
                  <p className="text-xs text-gray-500">to {formatTime(slot.endTime)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📢 SECTION 3: NOTICE BOARD */}
      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-4">📢 Notice Board</h2>
        
        {notices.length === 0 ? (
          <p className="text-gray-400 italic">No new notices.</p>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div 
                key={notice._id} 
                className={`p-5 rounded-xl border-l-4 shadow-sm bg-white transition hover:shadow-md ${
                  notice.isImportant ? "border-red-500 bg-red-50" : 
                  notice.courseOfferingId ? "border-orange-500 bg-orange-50" : "border-blue-500 bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      notice.courseOfferingId ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {notice.courseOfferingId 
                        ? `${notice.courseOfferingId.courseId?.code || 'Course'} Class` 
                        : "Official Notice"
                      }
                    </span>
                    <h3 className="text-lg font-bold mt-2 text-gray-800">{notice.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{notice.message}</p>
                
                <div className="mt-3 text-xs text-gray-400 text-right font-medium">
                  Posted by: {notice.createdBy?.name || "Admin"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;