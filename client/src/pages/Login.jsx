import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // 👉 CHANGED: State now stores 'rollNumber' instead of 'email'
  const [formData, setFormData] = useState({
    rollNumber: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const { rollNumber, password } = formData;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 👉 Send rollNumber + password
      await login(rollNumber, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // 👉 Send Google Token to backend
      await googleLogin(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      setError("Google Login Failed. Ensure your email is registered.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">College Portal Login</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* 👉 CHANGED: Input for Roll Number */}
          <div className="mb-4">
            <label className="block text-gray-700">Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={rollNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="e.g., 2026000001"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Login with Roll Number
          </button>
        </form>

        <div className="mt-4">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center mt-2">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;