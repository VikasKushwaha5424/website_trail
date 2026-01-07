import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lastLogin, setLastLogin] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem('userInfo');
    const storedTime = localStorage.getItem('loginTime');

    if (!storedData) {
      navigate('/');
    } else {
      const parsedData = JSON.parse(storedData);
      
      // --- THE FIX IS HERE ---
      // We check: Is the user info inside a 'user' folder? 
      // If yes, use parsedData.user. If no, use parsedData directly.
      const realUser = parsedData.user ? parsedData.user : parsedData;
      
      setUser(realUser);
      setLastLogin(storedTime);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('loginTime');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        
        <div className="profile-header">
          <div className="avatar">
            {/* Now this will correctly find the roll number */}
            {user.rollNumber ? user.rollNumber.charAt(0) : "U"}
          </div>
          <div>
            <h2>Welcome Back!</h2>
            <p className="role-badge">{user.role || "Student"}</p>
          </div>
        </div>

        <hr className="divider" />

        <div className="info-section">
          <div className="info-row">
            <span>Roll Number:</span>
            <strong>{user.rollNumber || "Not Available"}</strong>
          </div>
          
          <div className="info-row">
            <span>Email:</span>
            <strong>{user.email || "Not Available"}</strong>
          </div>

          <div className="info-row">
            <span>Last Login:</span>
            <strong className="time-text">{lastLogin || "Just now"}</strong>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;