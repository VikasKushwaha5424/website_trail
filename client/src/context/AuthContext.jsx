import { createContext, useState, useEffect } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in (on page refresh)
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // 2. Login Function (Merged Logic)
  const login = async (rollNumber, password) => {
    try {
      // Call the service (which calls the API)
      const data = await loginUser(rollNumber, password);

      // Save to LocalStorage
      // Note: Your backend returns a flat object { _id, name, role, token, ... }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // Update State
      setUser(data);

      // ⚠️ CRITICAL: Return the user data so Login.jsx can use it for redirection
      return data; 

    } catch (error) {
      console.error("Login failed inside Context:", error);
      throw error; // Throw error so Login.jsx can catch it and show the alert
    }
  };

  // 3. Logout Function
  const logout = () => {
    logoutUser();
    setUser(null);
    // Optional: Clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};