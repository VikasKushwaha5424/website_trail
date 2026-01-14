import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaUserGraduate, FaLock } from "react-icons/fa"; // Icons

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ rollNumber: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(form.rollNumber, form.password);
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "faculty") navigate("/faculty/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for future logic
    alert("Google Login coming soon! Please use your Roll Number.");
  };

  return (
    // 1. Background with Batch 3 Gradient
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-brand-DEFAULT to-brand-light p-4">
      
      {/* 2. Glassmorphism Card */}
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up border border-white/50">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-brand-light/30 text-brand-dark mb-3">
             {/* College Logo Icon Placeholder */}
             <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-1">Sign in to the College Portal</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm animate-fade-in">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Roll Number Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition">
              <FaUserGraduate />
            </div>
            <input
              type="text"
              name="rollNumber"
              value={form.rollNumber}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent outline-none transition bg-white/50 focus:bg-white"
              placeholder="Roll Number (e.g. 2026001)"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition">
              <FaLock />
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent outline-none transition bg-white/50 focus:bg-white"
              placeholder="Password"
              required
            />
          </div>

          {/* Main Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
        </div>

        {/* Google Button (Placeholder) */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition shadow-sm"
        >
          <FaGoogle className="text-red-500" />
          Sign in with Google
        </button>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => alert("Please contact the Administration department at Room 101.")}>Contact Admin</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;