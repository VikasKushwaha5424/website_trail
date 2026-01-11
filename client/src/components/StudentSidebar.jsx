import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../layouts/Layout.css';

const StudentSidebar = () => {
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
        <span className="role-text">Student Mode</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/student/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink to="/student/my-courses" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">📚</span>
          <span className="nav-label">My Courses</span>
        </NavLink>

        <NavLink to="/student/attendance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">📅</span>
          <span className="nav-label">Attendance</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <span className="logout-link" onClick={handleLogout}>Logout 🚪</span>
      </div>
    </div>
  );
};

export default StudentSidebar;