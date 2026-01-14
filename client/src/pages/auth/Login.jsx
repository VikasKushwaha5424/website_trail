import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaUserGraduate, FaLock, FaArrowRight } from "react-icons/fa";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for form inputs
  const [form, setForm] = useState({ rollNumber: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Input Change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle Login Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // 1. Call Login API (Passes rollNumber & password)
      const user = await login(form.rollNumber, form.password);
      
      console.log("✅ Login Success:", user);

      // 2. 🔀 Role-Based Redirection Logic
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        // Fallback for unknown roles
        navigate("/"); 
      }

    } catch (err) {
      // Handle Errors (Backend usually sends { message: "..." })
      setError(err.response?.data?.message || "Invalid Roll Number or Password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* ============================================================
          🎨 LEFT HALF: CREATIVITY & BRANDING
          (Hidden on mobile, visible on large screens)
         ============================================================ */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 items-center justify-center relative overflow-hidden">
        
        {/* Abstract Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[50px] border-white/5 rounded-full"></div>

        {/* Content Overlay */}
        <div className="relative z-10 p-12 text-center text-white">
           <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
             {/* College Logo Icon */}
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
             </svg>
           </div>
           
           <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
             Shape Your <br/> Future Here.
           </h1>
           <p className="text-lg opacity-80 max-w-md mx-auto leading-relaxed">
             Access your portal to track attendance, view grades, and manage your academic journey seamlessly.
           </p>
        </div>
      </div>

      {/* ============================================================
          🔐 RIGHT HALF: LOGIN FORM
         ============================================================ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to continue.</p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-center animate-pulse">
              <span className="font-bold mr-2">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Roll Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Roll Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition">
                  <FaUserGraduate />
                </div>
                <input
                  type="text"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="e.g. 2026001"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition">
                  <FaLock />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">Forgot Password?</a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition transform active:scale-95 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Signing In..." : (
                <>
                  Sign In <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">Or</span>
              </div>
          </div>

          {/* Social Login Stub */}
          <button 
            type="button"
            onClick={() => alert("Google Login is disabled in this demo.")}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            <FaGoogle className="text-red-500" />
            Continue with Google
          </button>

          <p className="text-center mt-8 text-sm text-gray-400">
            © 2026 College Management System
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;