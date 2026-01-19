import { useState, useContext } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Banknote, 
  MousePointerClick, 
  Star, 
  FileText, 
  CreditCard, 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from "lucide-react";

const StudentLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/student", icon: <LayoutDashboard size={22} />, end: true },
    { name: "My Courses", path: "/student/courses", icon: <BookOpen size={22} /> },
    { name: "My Schedule", path: "/student/schedule", icon: <CalendarDays size={22} /> },
    { name: "Fees & Payments", path: "/student/fees", icon: <Banknote size={22} /> },
    { name: "Electives", path: "/student/electives", icon: <MousePointerClick size={22} /> },
    { name: "Feedback", path: "/student/feedback", icon: <Star size={22} /> },
    { name: "Results", path: "/student/results", icon: <FileText size={22} /> },
    { name: "ID Card", path: "/student/id-card", icon: <CreditCard size={22} /> },
    { name: "Profile", path: "/student/profile", icon: <User size={22} /> },
    { name: "Notices", path: "/student/notices", icon: <Bell size={22} /> },
    { name: "Settings", path: "/student/settings", icon: <Settings size={22} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F0F4FF] font-sans overflow-hidden">
      {/* 🌟 DYNAMIC COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/50 flex flex-col transition-all duration-300 ease-in-out z-20
        ${isCollapsed ? "w-20" : "w-72"}`}
      >
        {/* Header with Toggle */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B9CEFF] to-[#C7B9FF] flex items-center justify-center text-indigo-700 font-bold text-xl shadow-lg">
                S
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg leading-tight">Student<br/><span className="text-[#C7B9FF]">Portal</span></h1>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 rounded-lg bg-gray-50 hover:bg-[#EAB9FF] hover:text-white transition-colors shadow-sm text-gray-500"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              title={isCollapsed ? item.name : ""}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${isActive 
                  ? "bg-gradient-to-r from-[#B9CEFF] to-[#C7B9FF] text-indigo-900 shadow-md font-semibold" 
                  : "text-gray-500 hover:bg-[#F0F4FF] hover:text-indigo-600"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              <span className="relative z-10 transition-transform group-hover:scale-110 duration-200">
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="whitespace-nowrap relative z-10 transition-all duration-300">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 w-full px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT AREA (Auto Resizes) */}
      <main className="flex-1 overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EAB9FF]/10 via-white/50 to-[#B9CEFF]/20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;