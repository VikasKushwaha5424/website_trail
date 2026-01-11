import axios from 'axios';

// 1. Create the instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add Interceptor (The "Middleman")
// Before sending any request, check if we have a token and attach it.
api.interceptors.request.use(
  (config) => {
    // ✅ FIX: Read the token directly from localStorage (matches your Login logic)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;