import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard'; // <--- 1. Import Dashboard

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Route for Login Page (Home) */}
        <Route path="/" element={<Login />} />
        
        {/* Route for Dashboard - THIS WAS MISSING */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;