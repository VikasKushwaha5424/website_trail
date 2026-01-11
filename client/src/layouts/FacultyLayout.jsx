import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import './Layout.css';

const FacultyLayout = () => {
  return (
    <div className="app-container">
      <Sidebar role="Faculty" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default FacultyLayout;