import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Import your newly created dashboard
import AdminDashboard from "./pages/admin/AdminDashboard";

// (Placeholder components for others to prevent errors for now)
const StudentDashboard = () => <div>Student Dashboard Coming Soon</div>;
const FacultyDashboard = () => <div>Faculty Dashboard Coming Soon</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 🛡️ ADMIN ROUTE */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Later you will add: */}
            {/* <Route path="/admin/students" element={<AdminStudents />} /> */}
          </Route>

          {/* 🎓 FACULTY ROUTE */}
          <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          </Route>

          {/* 🎒 STUDENT ROUTE */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;