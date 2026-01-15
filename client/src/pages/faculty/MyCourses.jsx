import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { 
  BookOpen, 
  ClipboardCheck, 
  GraduationCap, 
  Megaphone, 
  FileText, 
  X 
} from "lucide-react";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Announcements
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  // 1. Fetch Assigned Courses
  useEffect(() => {
    api.get("/faculty/courses")
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load courses", err);
        setLoading(false);
      });
  }, []);

  // 2. Open Announcement Modal
  const openNoticeModal = (course) => {
    setSelectedCourse(course);
    setNoticeTitle(`Update: ${course.course.code}`);
    setShowModal(true);
  };

  // 3. Submit Announcement
  const handlePostNotice = async () => {
    if (!noticeTitle || !noticeMessage) return alert("Please fill in all fields");

    try {
      await api.post("/faculty/announce", {
        courseOfferingId: selectedCourse.offeringId,
        title: noticeTitle,
        message: noticeMessage
      });
      alert("Notice Posted Successfully!");
      setShowModal(false);
      setNoticeMessage("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to post notice");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your courses...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-indigo-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">My Course Load</h1>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <p className="text-gray-500 text-lg">You haven't been assigned any courses for this semester yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.offeringId} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow flex flex-col">
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 text-white">
                <h3 className="font-bold text-xl">{c.course?.name}</h3>
                <div className="flex justify-between items-center mt-2 opacity-90 text-sm font-mono">
                  <span>{c.course?.code}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">Credits: {c.course?.credits}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 flex flex-col gap-3 flex-grow">
                
                {/* 1. Attendance */}
                <Link 
                  to={`/faculty/attendance/${c.offeringId}`} 
                  className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-3 rounded-lg border border-indigo-100 hover:bg-indigo-100 font-medium transition-colors"
                >
                  <ClipboardCheck size={18} /> Take Attendance
                </Link>

                {/* 2. Marks */}
                <Link 
                  to="/faculty/marks" 
                  className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-lg border border-green-100 hover:bg-green-100 font-medium transition-colors"
                >
                  <GraduationCap size={18} /> Gradebook
                </Link>

                {/* 3. Study Materials (The New Link) */}
                <Link 
                  to={`/faculty/resources/${c.offeringId}`} 
                  className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 py-3 rounded-lg border border-purple-100 hover:bg-purple-100 font-medium transition-colors"
                >
                  <FileText size={18} /> Study Materials
                </Link>

                {/* 4. Post Notice */}
                <button 
                  onClick={() => openNoticeModal(c)}
                  className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 py-3 rounded-lg border border-orange-100 hover:bg-orange-100 font-medium transition-colors mt-auto"
                >
                  <Megaphone size={18} /> Post Update
                </button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📢 NOTICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Post Class Update</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Class Cancelled"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <textarea 
                  className="w-full border border-gray-300 p-2.5 rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Enter details for your students..."
                />
              </div>

              <button 
                onClick={handlePostNotice}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                Send to Students
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;