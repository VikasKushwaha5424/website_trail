import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import './Login.css'; 

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault(); 

    const { rollNumber, password } = formData;

    if (!rollNumber || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
        // ORIGINAL: Hardcoded URL
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rollNumber, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login Successful!");
            
            // ORIGINAL: Saving data directly
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('loginTime', new Date().toLocaleString());

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
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Sign in to your account</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input 
              type="text" 
              name="rollNumber"
              placeholder="Roll Number" 
              value={formData.rollNumber}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <i 
              className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>

          <div className="options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" style={{ textDecoration: 'none', color: 'inherit' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-signin">Sign In</button>
        </form>

        <div className="divider">or continue with</div>

        <button className="btn-google">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" 
            width="20" 
            alt="Google" 
          />
          Google
        </button>

        <p className="footer-text">
          Don't have an account? 
          <Link to="/signup" style={{ marginLeft: '5px' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;