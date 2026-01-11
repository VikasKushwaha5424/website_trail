import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Quick Actions Data
  const actions = [
    { 
      title: "Add New User", 
      desc: "Create Student or Faculty accounts", 
      icon: "👤", 
      path: "/admin/users",
      color: "coral"
    },
    { 
      title: "Assign Faculty", 
      desc: "Link teachers to their subjects", 
      icon: "🔗", 
      path: "/admin/assign",
      color: "green"
    },
    { 
      title: "Add Course", 
      desc: "Create new subjects in the system", 
      icon: "📚", 
      path: "/admin/courses", // We will build this page later
      color: "mustard"
    },
    { 
      title: "Departments", 
      desc: "Manage college departments", 
      icon: "🏢", 
      path: "/admin/departments", // We will build this page later
      color: "purple"
    }
  ];

  return (
    <div className="admin-dashboard">
      
      {/* 1. Header Section */}
      <div className="admin-header">
        <h1>🛠️ Admin Control Panel</h1>
        <p>Welcome, {user?.name || "Administrator"}. Manage your system below.</p>
      </div>

      <hr className="divider" />

      {/* 2. Action Grid */}
      <div className="action-grid">
        {actions.map((action, index) => (
          <div 
            key={index} 
            className={`action-card ${action.color}`}
            onClick={() => navigate(action.path)}
          >
            <div className="icon-wrapper">{action.icon}</div>
            <div className="info">
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
            </div>
            <div className="arrow">→</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;