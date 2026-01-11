// client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../layouts/Layout.css'; 

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const menuConfig = {
    Student: [
      { label: 'Dashboard', path: '/student/dashboard', icon: '🏠' },
      { label: 'My Courses', path: '/student/my-courses', icon: '📚' },
      { label: 'Attendance', path: '/student/attendance', icon: '📅' },
    ],
    Faculty: [
      { label: 'Dashboard', path: '/faculty/dashboard', icon: '🏠' },
      { label: 'Mark Attendance', path: '/faculty/mark-attendance', icon: '✅' },
      { label: 'Upload Marks', path: '/faculty/upload-marks', icon: '📝' },
    ],
    Admin: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: '🛠️' },
      { label: 'Manage Users', path: '/admin/add-user', icon: '👥' },
      { label: 'Assign Faculty', path: '/admin/assign-faculty', icon: '🔗' },
      { label: 'Departments', path: '/admin/departments', icon: '🏢' },
    ]
  };

  const currentMenu = menuConfig[role] || [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>CMS Portal</h3>
        <span className="role-text">{role} Mode</span>
      </div>
      <nav className="sidebar-nav">
        {currentMenu.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="logout-link" onClick={handleLogout}>Logout 🚪</span>
      </div>
    </div>
  );
};

export default Sidebar;