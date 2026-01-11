import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Context Provider (CRITICAL FIX)
import { AuthProvider } from './context/AuthContext'; 

// 2. Layouts
import StudentLayout from './layouts/StudentLayout'; 

// 3. Auth Pages
import Login from './pages/auth/Login';

// 4. Dashboard Pages
import StudentDashboard from './pages/student/Dashboard';
import FacultyDashboard from './pages/faculty/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// 5. Feature Pages
import AssignFaculty from './pages/admin/AssignFaculty'; 
import MarkAttendance from './pages/faculty/MarkAttendance'; 

// 6. Fallback
const NotFound = () => <div style={{textAlign:'center', marginTop:'50px'}}><h2>404 - Page Not Found</h2></div>;

function App() {
  return (
    // ✅ Fix: AuthProvider must wrap the entire app so Sidebar can access user data
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* --- STUDENT SECTION --- */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>

          {/* --- FACULTY SECTION --- */}
          <Route path="/faculty" element={<StudentLayout />}>
             <Route path="dashboard" element={<FacultyDashboard />} />
             <Route path="mark-attendance" element={<MarkAttendance />} />
          </Route>

          {/* --- ADMIN SECTION --- */}
          <Route path="/admin" element={<StudentLayout />}>
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="assign-faculty" element={<AssignFaculty />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;