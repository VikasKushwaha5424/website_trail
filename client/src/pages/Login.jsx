// client/src/pages/Login.jsx
import { useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login request to server
      const { data } = await API.post("/auth/login", { email, password });
      
      // Save user data
      login(data);
      toast.success("Login Successful!");
      
      // Redirect based on role
      if (data.role === "student") navigate("/student-dashboard");
      else if (data.role === "admin") navigate("/admin-dashboard");
      else navigate("/faculty-dashboard");
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Portal Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full border p-2 mb-4 rounded"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 mb-6 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-bold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;