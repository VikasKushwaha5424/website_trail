// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 

// Layouts
import StudentLayout from './layouts/StudentLayout'; 
import FacultyLayout from './layouts/FacultyLayout'; 
import AdminLayout from './layouts/AdminLayout';     

// Pages
import Login from './pages/auth/Login';
import StudentDashboard from './pages/student/Dashboard';
import FacultyDashboard from './pages/faculty/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AddUser from './pages/admin/AddUser'; 
import AssignFaculty from './pages/admin/AssignFaculty'; 
import MarkAttendance from './pages/faculty/MarkAttendance'; 

const NotFound = () => (
  <div style={{textAlign:'center', marginTop:'50px'}}>
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* ADMIN SECTION */}
          {/* Matches /admin */}
          <Route path="/admin" element={<AdminLayout />}>
             {/* Redirects /admin to /admin/dashboard */}
             <Route index element={<Navigate to="dashboard" replace />} />
             
             {/* Matches /admin/dashboard */}
             <Route path="dashboard" element={<AdminDashboard />} />
             {/* Matches /admin/add-user */}
             <Route path="add-user" element={<AddUser />} /> 
             {/* Matches /admin/assign-faculty */}
             <Route path="assign-faculty" element={<AssignFaculty />} />
             {/* Matches /admin/departments */}
             <Route path="departments" element={<div>Departments Page</div>} />
          </Route>

          {/* FACULTY SECTION */}
          <Route path="/faculty" element={<FacultyLayout />}>
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="dashboard" element={<FacultyDashboard />} />
             <Route path="mark-attendance" element={<MarkAttendance />} />
             <Route path="upload-marks" element={<div>Upload Marks Page</div>} />
          </Route>

          {/* STUDENT SECTION */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my-courses" element={<div>My Courses Page</div>} />
            <Route path="attendance" element={<div>Attendance Page</div>} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;