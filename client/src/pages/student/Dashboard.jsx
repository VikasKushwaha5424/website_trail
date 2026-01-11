import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth(); // <--- secure access to user data

  // Safety check: If user isn't loaded yet, show a loader or nothing
  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-content">
      
      {/* 1. Welcome Card */}
      <div className="welcome-section">
        <div className="avatar-circle">
            {user.rollNumber ? user.rollNumber.charAt(0) : "S"}
        </div>
        <div className="welcome-text">
            <h1>Hello, {user.name || "Student"}! 👋</h1>
            <p className="subtitle">
                Roll Number: <strong>{user.rollNumber}</strong> | {user.email}
            </p>
        </div>
      </div>

      <hr className="divider" />

      {/* 2. Stats Grid (Placeholders for Phase 2) */}
      <div className="stats-grid">
        
        {/* Attendance Card */}
        <div className="stat-card">
            <div className="stat-icon green">📅</div>
            <div className="stat-info">
                <h3>Attendance</h3>
                <p className="stat-value">85%</p>
                <span className="stat-label">Overall</span>
            </div>
        </div>

        {/* Marks Card */}
        <div className="stat-card">
            <div className="stat-icon coral">📊</div>
            <div className="stat-info">
                <h3>CGPA</h3>
                <p className="stat-value">8.5</p>
                <span className="stat-label">Last Semester</span>
            </div>
        </div>

        {/* Notices Card */}
        <div className="stat-card">
            <div className="stat-icon mustard">🔔</div>
            <div className="stat-info">
                <h3>Notices</h3>
                <p className="stat-value">2 New</p>
                <span className="stat-label">Check Announcements</span>
            </div>
        </div>

      </div>

      {/* 3. Recent Activity (Example) */}
      <div className="recent-activity">
        <h3>📢 Recent Updates</h3>
        <div className="activity-item">
            <span className="date">Today</span>
            <p>Your attendance for <strong>Computer Networks</strong> was marked present.</p>
        </div>
        <div className="activity-item">
            <span className="date">Yesterday</span>
            <p>New assignment uploaded in <strong>Database Management</strong>.</p>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;