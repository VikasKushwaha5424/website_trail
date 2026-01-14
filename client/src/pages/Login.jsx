import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { toast } from "react-toastify";

// Firebase Imports
import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Handle Standard Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      handleLoginSuccess(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🔐 SECURE GOOGLE LOGIN
  // ==========================================
  const handleGoogleLogin = async () => {
    try {
      // 1. Trigger Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. GET THE SECURITY TOKEN (This proves identity)
      const token = await result.user.getIdToken(); 

      // 3. SEND TOKEN TO SERVER
      // The server will verify this token and check if the email exists in the DB.
      const { data } = await API.post("/auth/google-login", { 
        googleToken: token 
      });

      handleLoginSuccess(data);

    } catch (error) {
      console.error("Google Login Error:", error);
      
      // Show the specific error from the backend (e.g., "Email not registered")
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || "Google Login Failed");
    }
  };

  // Centralized Success Handler
  const handleLoginSuccess = (userData) => {
    login(userData);
    toast.success(`Welcome back, ${userData.name}!`);
    
    // Role-based Redirect
    switch (userData.role) {
      case "student": navigate("/student-dashboard"); break;
      case "admin": navigate("/admin-dashboard"); break;
      case "faculty": navigate("/faculty-dashboard"); break;
      default: navigate("/");
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      
      {/* LEFT SIDE - Branding Area (Uses Batch 3 Colors) */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex-col justify-center items-center text-white p-12">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/30 text-center">
          <h1 className="text-4xl font-bold mb-4 text-brand-dark">College Portal</h1>
          <p className="text-lg text-gray-800">
            Manage your academics, attendance, and fees in one place.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-white">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition outline-none"
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition outline-none"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-brand-secondary hover:bg-brand-accent text-brand-dark font-bold p-3 rounded-lg transition duration-300 shadow-md transform active:scale-95"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold p-3 rounded-lg flex items-center justify-center transition gap-3"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <span className="text-brand-secondary font-bold cursor-pointer hover:underline">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;