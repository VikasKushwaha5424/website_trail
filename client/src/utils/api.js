import axios from "axios";

// 1. Create the Axios Instance
const api = axios.create({
  // 👇 FIX: Use Vite's environment variable, fallback to localhost only for dev
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. The "Interceptor" (Automatically adds Token to every request)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;