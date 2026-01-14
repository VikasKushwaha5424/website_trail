import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // If not logged in, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the child component (Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;