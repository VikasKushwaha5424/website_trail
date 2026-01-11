import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../layouts/Layout.css';

const FacultySidebar = () => {
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
        <span className="role-text">Faculty Mode</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/faculty/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink to="/faculty/mark-attendance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">✅</span>
          <span className="nav-label">Mark Attendance</span>
        </NavLink>
        
        <NavLink to="/faculty/upload-marks" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">📝</span>
          <span className="nav-label">Upload Marks</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <span className="logout-link" onClick={handleLogout}>Logout 🚪</span>
      </div>
    </div>
  );
};

export default FacultySidebar;