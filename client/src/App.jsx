import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";

// Placeholder Dashboards (Create these files later!)
const AdminDashboard = () => <h1>Welcome Admin</h1>;
const FacultyDashboard = () => <h1>Welcome Faculty</h1>;
const StudentDashboard = () => <h1>Welcome Student</h1>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirect Root to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes (We will add strict protection later) */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;