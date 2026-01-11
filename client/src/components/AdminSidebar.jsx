// client/src/components/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../layouts/Layout.css';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>CMS Portal</h3>
        <span className="role-text">Admin Mode</span>
      </div>
      <nav className="sidebar-nav">
        {/* ✅ Absolute Paths are critical here */}
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">🛠️</span>Dashboard
        </NavLink>
        <NavLink to="/admin/add-user" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">👥</span>Manage Users
        </NavLink>
        <NavLink to="/admin/assign-faculty" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">🔗</span>Assign Faculty
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <span className="logout-link" onClick={handleLogout}>Logout 🚪</span>
      </div>
    </div>
  );
};
export default AdminSidebar;