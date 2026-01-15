import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
// 👇 I have combined all your requested icons here into one import
import { 
  LayoutDashboard, 
  MousePointerClick, // Matches your snippet for "Electives"
  FileText,          
  CreditCard,        // Matches your snippet for "ID Card"
  Star,              // Matches your snippet for "Rate Faculty"
  LogOut 
} from "lucide-react";

const StudentLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 👇 Your menu items using those specific icons
  const navItems = [
    { name: "Dashboard", path: "/student", icon: <LayoutDashboard size={20} />, end: true },
    { name: "Electives", path: "/student/electives", icon: <MousePointerClick size={20} /> },
    { name: "Rate Faculty", path: "/student/feedback", icon: <Star size={20} /> },
    { name: "Results", path: "/student/results", icon: <FileText size={20} /> },
    { name: "ID Card", path: "/student/id-card", icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🟠 SIDEBAR (Student Theme: Orange/Red) */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo Area */}
        <div className="p-6 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="text-xl font-bold text-gray-800">Student Portal</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-medium"
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

      {/* 🟠 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;