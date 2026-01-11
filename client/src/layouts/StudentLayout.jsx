import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar'; // NEW IMPORT
import './Layout.css'; 

const StudentLayout = () => {
  return (
    <div className="app-container">
      <StudentSidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;