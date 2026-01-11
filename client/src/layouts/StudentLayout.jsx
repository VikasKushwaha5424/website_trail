import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Layout.css';

const StudentLayout = () => {
  return (
    <div className="app-container">
      {/* Left Side: Navigation */}
      <Sidebar />

      {/* Right Side: The changing content (Dashboard, Marks, etc.) */}
      <main className="main-content">
        <div className="top-bar">
          <h3>Welcome Back!</h3>
          <span className="date">{new Date().toDateString()}</span>
        </div>
        
        {/* <Outlet /> renders the child page (e.g., Dashboard.jsx) here */}
        <div className="page-wrapper">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;