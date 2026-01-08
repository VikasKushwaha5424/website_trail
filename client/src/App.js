import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
// Any other imports you had originally

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Any other routes you had originally */}
    </Routes>
  );
}

export default App;