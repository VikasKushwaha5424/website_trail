import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth"; 
import { auth, googleProvider } from "../firebase"; 
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  // REVERTED: State now uses rollNumber again
  const [formData, setFormData] = useState({
    rollNumber: '', 
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- 1. GOOGLE LOGIN (Uses Email) ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;

      console.log("Google Authenticated Email:", email); // Debugging

      // Send Email to backend to check if it exists in DB
      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Google Login Successful!");
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        if (data.user.role === 'Admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // This happens if the email is valid for Google, but not in your MongoDB
        alert(data.message || "This Google Email is not registered in our college database.");
      }
    } catch (error) {
      console.error("Google Login Error Full Object:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Configuration Error: Please add 'localhost' to Authorized Domains in Firebase Console.");
      } else {
        alert("Google Sign-In failed. Check console for details.");
      }
    }
  };

  // --- 2. MANUAL LOGIN (Uses Roll Number) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const { rollNumber, password } = formData;

    if (!rollNumber || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // REVERTED: Sending rollNumber to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login Successful!");
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        if (data.role === 'Admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.message || "Invalid Roll Number or Password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Is your backend server running?");
    }
  };

  return (
    <div className="login-body-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* REVERTED: Roll Number Input */}
          <div className="input-group">
            <label htmlFor="rollNumber">Roll Number</label>
            <input 
              type="text" 
              id="rollNumber"
              name="rollNumber"
              placeholder="Enter your Roll Number" 
              value={formData.rollNumber}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                name="password"
                placeholder="Enter password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <button 
                type="button" 
                className="toggle-btn" 
                onClick={togglePasswordVisibility}
                title="Show/Hide Password"
              >
                <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="primary-btn">Sign In</button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" 
            alt="Google" 
          />
          Sign in with Google
        </button>

      </div>
    </div>
  );
};

export default Login;