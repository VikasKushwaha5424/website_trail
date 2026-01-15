import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Adjust this endpoint matches your backend route for fetching notices
        // Example: router.get('/student/dashboard', ...) in your backend
        const { data } = await api.get("/student/dashboard"); 
        
        // Assuming the backend returns { notices: [...] } or just [...]
        setNotices(data.notices || data || []); 
      } catch (error) {
        console.error("Failed to load student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}</p>
      </header>

      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Notice Board</h2>
        
        {notices.length === 0 ? (
          <p className="text-gray-400 italic">No new notices.</p>
        ) : (
          <div className="space-y-4">
            {/* ✅ YOUR ORIGINAL SNIPPET LOGIC GOES HERE */}
            {notices.map((notice) => (
              <div 
                key={notice._id} 
                className={`p-5 rounded-xl border-l-4 shadow-sm bg-white ${
                  notice.isImportant ? "border-red-500 bg-red-50" : 
                  notice.courseOfferingId ? "border-orange-500" : "border-blue-500"
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
                  <span className="text-xs text-gray-400">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{notice.message}</p>
                
                <div className="mt-3 text-xs text-gray-400 text-right">
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