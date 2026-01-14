import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // 1. If not logged in, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but role is not allowed, go to their own dashboard (or unauthorized page)
  if (!allowedRoles.includes(user.role)) {
    // Redirect based on their actual role to prevent getting stuck
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  // 3. If authorized, render the child components (the dashboard)
  return <Outlet />;
};

export default ProtectedRoute;