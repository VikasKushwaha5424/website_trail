import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Using your existing Sidebar
import './Layout.css'; // Shared CSS

const AdminLayout = () => {
  return (
    <div className="app-container">
      {/* We pass role="Admin" so Sidebar can eventually show Admin links */}
      <Sidebar role="Admin" /> 
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;