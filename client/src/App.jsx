import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // ✅ Import AuthContext
import { useContext } from "react"; // ✅ Import useContext hook
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";

// 🔒 Protected Route Component
// Checks if user is logged in using the Global State (Context)
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext); // ✅ Use Context (Reactive) instead of localStorage (Static)
  
  // Note: AuthProvider blocks rendering until initial loading is done, 
  // so we don't need to check 'loading' here.
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* ToastContainer shows the popup alerts */}
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          {/* Default Route: Redirect to Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Student Route */}
          <Route 
            path="/student-dashboard" 
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;