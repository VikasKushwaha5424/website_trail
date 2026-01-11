import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase"; 
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    rollNumber: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state

  // --- HANDLE INPUT CHANGE ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- KEY FUNCTION: REDIRECT BASED ON ROLE ---
  const handleRedirect = (role) => {
    console.log("🔀 Redirecting user with role:", role);
    
    switch (role) {
      case 'Admin':
        navigate('/admin/dashboard');
        break;
      case 'Faculty':
        navigate('/faculty/dashboard');
        break;
      case 'Student':
        navigate('/student/dashboard');
        break;
      default:
        console.warn("⚠️ Unknown Role:", role);
        alert("Login successful, but role is unknown. Redirecting to home.");
        navigate('/'); // Fallback
    }
  };

  // --- 1. MANUAL LOGIN SUBMIT ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔵 Attempting Login for:", formData.rollNumber);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("🟢 Server Response:", data);

      if (response.ok) {
        // 1. Save Token & User Info
        localStorage.setItem('token', data.token); // Save token separately often helps
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        // 2. Alert & Redirect
        alert(`Welcome, ${data.user.name || "User"}!`);
        
        // CRITICAL FIX: Ensure we read 'role' from the correct spot
        handleRedirect(data.user.role); 
      } else {
        alert(data.message || "Invalid Credentials");
      }

    } catch (error) {
      console.error("❌ Login Error:", error);
      alert("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      console.log("🔵 Google Email:", email);

      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        alert("Google Login Successful!");
        handleRedirect(data.user.role);
      } else {
        alert(data.message || "Google email not found in database.");
      }
    } catch (error) {
      console.error("❌ Google Login Error:", error);
      alert("Google Sign-In Failed");
    }
  };

  return (
    <div className="login-body-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Portal Login</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Roll Number Input */}
          <div className="input-group">
            <label>Roll Number / ID</label>
            <input 
              type="text" 
              name="rollNumber"
              placeholder="Ex: ADM001, FAC001" 
              value={formData.rollNumber}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="Enter password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <button 
                type="button" 
                className="toggle-btn" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;