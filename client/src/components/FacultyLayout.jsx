import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardCheck, 
  GraduationCap, 
  Briefcase,
  LogOut,
  CalendarDays,
  Star // 👈 1. Added Import
} from "lucide-react";

const FacultyLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/faculty", icon: <LayoutDashboard size={20} />, end: true },
    { name: "My Schedule", path: "/faculty/schedule", icon: <CalendarDays size={20} /> },
    { name: "My Courses", path: "/faculty/courses", icon: <BookOpen size={20} /> },
    { name: "Attendance", path: "/faculty/attendance", icon: <ClipboardCheck size={20} /> },
    { name: "Enter Marks", path: "/faculty/marks", icon: <GraduationCap size={20} /> },
    { name: "My Performance", path: "/faculty/performance", icon: <Star size={20} /> }, // 👈 2. Added Item
    { name: "Apply Leave", path: "/faculty/leave", icon: <Briefcase size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🟢 SIDEBAR (Faculty Theme: Indigo/Blue) */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo Area */}
        <div className="p-6 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <span className="text-xl font-bold text-gray-800">Faculty Portal</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end} // Important for the root path "/faculty"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 🔵 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* Renders Dashboard, MyCourses, Performance, etc. */}
      </main>
    </div>
  );
};

export default FacultyLayout;