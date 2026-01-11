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

const NotFound = () => <div style={{textAlign:'center', marginTop:'50px'}}><h2>404 - Page Not Found</h2></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* 🎓 STUDENT SECTION */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            {/* Future Student Routes */}
            <Route path="my-courses" element={<div>My Courses Page</div>} />
            <Route path="attendance" element={<div>Attendance Page</div>} />
          </Route>

          {/* 👨‍🏫 FACULTY SECTION */}
          <Route path="/faculty" element={<FacultyLayout />}>
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="dashboard" element={<FacultyDashboard />} />
             <Route path="mark-attendance" element={<MarkAttendance />} />
             <Route path="upload-marks" element={<div>Upload Marks Page</div>} />
          </Route>

          {/* 🛠️ ADMIN SECTION */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="add-user" element={<AddUser />} /> 
             <Route path="assign-faculty" element={<AssignFaculty />} />
             <Route path="departments" element={<div>Departments Page</div>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;