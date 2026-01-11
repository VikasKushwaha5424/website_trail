import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- FIXED IMPORT
import '../layouts/Layout.css';

const Sidebar = () => {
  const { user, logout } = useAuth(); // <--- FIXED USAGE
  const navigate = useNavigate();

  // Fallback role if user isn't loaded yet
  const role = user?.role || 'Student'; 

  // Define menu items for each role
  const menuItems = {
    Student: [
      { path: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/student/courses', icon: '📚', label: 'My Courses' },
      { path: '/student/attendance', icon: '📅', label: 'Attendance' },
      { path: '/student/marks', icon: '📊', label: 'My Marks' },
    ],
    Faculty: [
      { path: '/faculty/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/faculty/courses', icon: '👨‍🏫', label: 'My Classes' },
      { path: '/faculty/attendance', icon: '✅', label: 'Mark Attendance' },
    ],
    Admin: [
      { path: '/admin/dashboard', icon: '🛠️', label: 'Dashboard' },
      { path: '/admin/users', icon: '👥', label: 'Manage Users' },
      { path: '/admin/assign', icon: '🔗', label: 'Assign Faculty' },
    ]
  };

  const currentMenu = menuItems[role] || menuItems['Student'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🎓 College Portal</h2>
        <p className="user-badge">{role}</p>
      </div>

      <nav className="sidebar-nav">
        {currentMenu.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;