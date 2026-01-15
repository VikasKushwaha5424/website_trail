import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarRange, 
  CalendarDays, 
  CreditCard, 
  Megaphone, 
  LogOut,
  Home,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  MessageSquare,
  Briefcase,
  Settings // 👈 IMPORTED
} from "lucide-react";

const AdminLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
    { name: "Academics", path: "/admin/academics", icon: <BookOpen size={20} /> },
    { name: "Classes", path: "/admin/classes", icon: <CalendarRange size={20} /> },
    { name: "Timetable", path: "/admin/timetable", icon: <CalendarDays size={20} /> },
    { name: "Exams", path: "/admin/exams", icon: <Calendar size={20} /> },
    { name: "Attendance", path: "/admin/attendance", icon: <ClipboardCheck size={20} /> },
    { name: "Promote", path: "/admin/promote", icon: <TrendingUp size={20} /> },
    { name: "Fees", path: "/admin/fees", icon: <CreditCard size={20} /> },
    { name: "Hostel", path: "/admin/hostel", icon: <Home size={20} /> },
    { name: "Leaves", path: "/admin/leaves", icon: <Briefcase size={20} /> },
    { name: "Notices", path: "/admin/notices", icon: <Megaphone size={20} /> },
    { name: "Feedback", path: "/admin/feedback", icon: <MessageSquare size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> }, // 👈 ADDED SETTINGS LINK
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🟢 SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo Area */}
        <div className="p-6 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold text-gray-800">Admin Portal</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
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
        <Outlet /> {/* This is where the specific page content renders */}
      </main>
    </div>
  );
};

export default AdminLayout;