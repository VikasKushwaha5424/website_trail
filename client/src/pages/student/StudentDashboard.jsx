import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [dailySchedule, setDailySchedule] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Helper: Time Formatter
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Notices (Matches route in studentRoutes.js)
        const noticesRes = await api.get("/student/announcements");
        setNotices(noticesRes.data);

        // 2. Fetch Today's Schedule (Matches route in timetableRoutes.js)
        const scheduleRes = await api.get("/timetable/daily");
        setDailySchedule(scheduleRes.data); // Expects { day: "MONDAY", schedule: [...] }

      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
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

      {/* 🟢 SECTION 1: TODAY'S SCHEDULE */}
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

      {/* 🔵 SECTION 2: NOTICE BOARD */}
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