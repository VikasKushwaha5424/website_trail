import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

// Import Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AcademicStructure from "./pages/admin/AcademicStructure";
import ClassOperations from "./pages/admin/ClassOperations";
import TimetableScheduler from "./pages/admin/TimetableScheduler";
import FeeManagement from "./pages/admin/FeeManagement";
import AnnouncementPage from "./pages/admin/AnnouncementPage";
import HostelAllocation from "./pages/admin/HostelAllocation";
import ExamScheduler from "./pages/admin/ExamScheduler";
import AttendanceMonitor from "./pages/admin/AttendanceMonitor"; // 👈 1. Import AttendanceMonitor

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 🛡️ PROTECTED ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            
            {/* Admin Layout Wrapper */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="academics" element={<AcademicStructure />} />
              <Route path="classes" element={<ClassOperations />} />
              <Route path="timetable" element={<TimetableScheduler />} />
              <Route path="exams" element={<ExamScheduler />} />
              <Route path="attendance" element={<AttendanceMonitor />} /> {/* 👈 2. Add Attendance Route */}
              <Route path="fees" element={<FeeManagement />} />
              <Route path="hostel" element={<HostelAllocation />} />
              <Route path="notices" element={<AnnouncementPage />} />
            </Route>

          </Route>

          {/* 404 Route */}
          <Route path="*" element={<div>Page Not Found</div>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;