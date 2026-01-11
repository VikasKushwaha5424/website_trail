import React from 'react';
import { Outlet } from 'react-router-dom';
// ✅ IMPORT THE SPECIFIC ADMIN SIDEBAR (Make sure you created this file!)
import AdminSidebar from '../components/AdminSidebar'; 
import './Layout.css';

const AdminLayout = () => {
  return (
    <div className="app-container">
      {/* Use AdminSidebar which has hardcoded links like '/admin/add-user' */}
      <AdminSidebar /> 
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;