import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Hash, 
  GraduationCap,
  Plus,
  MoreHorizontal,
  Bell, 
  X,
  TrendingUp
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Data States
  const [notices, setNotices] = useState([]);
  const [dailySchedule, setDailySchedule] = useState(null); 
  const [studentProfile, setStudentProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  // 🔔 NOTIFICATION STATE
  const [newNotice, setNewNotice] = useState(null);
  const socket = useSocket();

  // 📝 To-Do State for "Box 3"
  const [todos, setTodos] = useState([
    { id: 1, task: "Complete React Assignment", done: false },
    { id: 2, task: "Pay Semester Fees", done: true },
    { id: 3, task: "Submit Elective Form", done: false },
  ]);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

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
        // Fetch Notices
        const noticesRes = await api.get("/student/announcements");
        setNotices(noticesRes.data);

        // Fetch Schedule
        const scheduleRes = await api.get("/timetable/daily");
        setDailySchedule(scheduleRes.data);

        // Fetch Profile (For extra details like Hostel if needed)
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

  if (loading) return <div className="p-20 text-center text-[#B9CEFF] animate-pulse">Loading Your Dashboard...</div>;

  return (
    <div className="space-y-8 relative">
      
      {/* 🔔 REAL-TIME TOAST NOTIFICATION POPUP */}
      {newNotice && (
        <div className="fixed top-20 right-5 bg-white border-l-4 border-indigo-500 shadow-2xl rounded-xl p-4 z-50 w-80 animate-bounce md:animate-none transition-all duration-300 transform translate-x-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">New Announcement!</h4>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            <button onClick={() => setNewNotice(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="mt-3 bg-gray-50 p-3 rounded-lg">
            <p className="font-bold text-gray-800 text-sm">{newNotice.title}</p>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{newNotice.message}</p>
          </div>
        </div>
      )}

      {/* 👋 Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Hello, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 font-medium mt-2">Here's what's happening today.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Date</p>
          <p className="text-2xl font-bold text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* 📦 THE 3 MAGIC BOXES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ==========================
            BOX 1: PROFILE CARD 
           ========================== */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#B9CEFF] to-[#C7B9FF] rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl h-full flex flex-col items-center text-center">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#EAB9FF] to-[#C7B9FF] p-1 shadow-lg mb-4">
               <img 
                 src={user?.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                 alt="Profile" 
                 className="w-full h-full rounded-full bg-white object-cover"
               />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <span className="bg-[#B9CEFF]/30 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-2">
              {user?.role}
            </span>

            <div className="mt-8 w-full space-y-4 text-left bg-white/40 p-5 rounded-2xl border border-white/60">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-[#FFEAB9] p-2 rounded-lg text-orange-600"><Hash size={18}/></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Roll Number</p>
                  <p className="font-semibold">{user?.rollNumber || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-[#CEFFB9] p-2 rounded-lg text-green-700"><Mail size={18}/></div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                  <p className="font-semibold truncate w-40" title={user?.email}>{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                 <div className="bg-[#C7B9FF] p-2 rounded-lg text-purple-700"><GraduationCap size={18}/></div>
                 <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Batch</p>
                    <p className="font-semibold">{studentProfile?.batchYear || "2026"} Grad</p>
                 </div>
              </div>
            </div>

            <Link to="/student/profile" className="mt-6 w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              View Full Profile
            </Link>
          </div>
        </div>

        {/* ==========================
            BOX 2: TIME TABLE 
           ========================== */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-[#FFC7B9] to-[#FFEAB9] rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
           <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-orange-500"/> Timetable
                </h2>
                <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded">TODAY</span>
              </div>

              {!dailySchedule?.schedule || dailySchedule.schedule.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 bg-white/30 rounded-2xl border border-dashed border-gray-300 min-h-[200px]">
                   <Clock size={40} className="mb-2 opacity-50"/>
                   <p>No classes today!</p>
                   <p className="text-xs">Enjoy your free time.</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                  {dailySchedule.schedule.map((slot, index) => (
                    <div key={index} className="group/item flex items-center gap-4 p-4 rounded-2xl bg-white/40 border border-white/60 hover:bg-white/80 transition-all hover:shadow-md cursor-default">
                       <div className="flex flex-col items-center min-w-[60px]">
                          <span className="font-bold text-gray-800">{formatTime(slot.startTime)}</span>
                          <div className="h-8 w-0.5 bg-gray-300 my-1 group-hover/item:bg-orange-400 transition-colors"></div>
                          <span className="text-xs text-gray-500">{formatTime(slot.endTime)}</span>
                       </div>
                       
                       <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{slot.courseOfferingId?.courseId?.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                             <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                               {slot.courseOfferingId?.courseId?.code}
                             </span>
                             <span>• Room {slot.roomNumber}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* ==========================
            BOX 3: TO-DO LIST 
           ========================== */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-[#B9FFC7] to-[#CEFFB9] rounded-3xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
           <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle2 className="text-green-600"/> To-Do List
                </h2>
                <button className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                   <Plus size={18}/>
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                 {todos.map((todo) => (
                    <div 
                      key={todo.id} 
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 group/todo
                        ${todo.done ? "bg-green-50/50 opacity-60" : "bg-white/70 border border-white/80 shadow-sm hover:shadow-md hover:scale-[1.02]"}`}
                    >
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                          ${todo.done ? "bg-green-500 border-green-500" : "border-gray-300 group-hover/todo:border-green-500"}`}>
                          {todo.done && <CheckCircle2 size={14} className="text-white"/>}
                       </div>
                       <span className={`font-medium flex-1 ${todo.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                         {todo.task}
                       </span>
                       <MoreHorizontal size={16} className="text-gray-400 opacity-0 group-hover/todo:opacity-100"/>
                    </div>
                 ))}
                 
                 <div className="p-4 rounded-2xl border-2 border-dashed border-gray-300 text-center text-gray-400 text-sm hover:bg-white/30 cursor-pointer transition">
                    + Add new task
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* 📢 NOTICE BOARD SECTION (BELOW THE BOXES) */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
          📢 Recent Notices
        </h2>
        
        {notices.length === 0 ? (
          <div className="p-10 text-center bg-white/50 rounded-2xl border border-gray-200">
            <p className="text-gray-400 italic">No new notices posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((notice) => (
              <div 
                key={notice._id} 
                className={`p-6 rounded-2xl border-l-4 shadow-sm bg-white hover:shadow-lg transition-all transform hover:-translate-y-1 ${
                  notice.isImportant ? "border-red-500 bg-red-50/30" : 
                  notice.courseOfferingId ? "border-orange-500 bg-orange-50/30" : "border-indigo-500 bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                      notice.courseOfferingId ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {notice.courseOfferingId 
                        ? `${notice.courseOfferingId.courseId?.code || 'Class'} Alert` 
                        : "Official Notice"
                      }
                    </span>
                    <h3 className="text-lg font-bold mt-3 text-gray-800 leading-tight">{notice.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-sm mb-4">{notice.message}</p>
                
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {notice.createdBy?.name?.charAt(0) || "A"}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Posted by {notice.createdBy?.name || "Admin"}
                  </span>
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