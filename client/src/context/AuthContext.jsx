import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Ideally verify token with backend here, for now just loading
      setLoading(false); 
      // (Optional: Decode token to get user info if needed immediately)
    } else {
      setLoading(false);
    }
  }, []);

  // 👉 CHANGED: Login now accepts rollNumber instead of email
  const login = async (rollNumber, password) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      rollNumber, 
      password,
    });
    
    localStorage.setItem("token", res.data.token);
    setUser(res.data);
  };

  const googleLogin = async (googleToken) => {
    const res = await axios.post("http://localhost:5000/api/auth/google", {
      googleToken,
    });

    localStorage.setItem("token", res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};