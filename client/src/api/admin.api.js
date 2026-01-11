import axios from 'axios';

// 1. Create a centralized Axios instance
const API = axios.create({ 
  baseURL: 'http://localhost:5000/api' 
});

// 2. THE INTERCEPTOR (Crucial: Adds the Token to every request)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  return req;
});

// 3. Define the Admin API calls
export const adminAPI = {
  
  // --- EXISTING FUNCTION (Keep this so "Add User" page works!) ---
  addUser: async (userData) => {
    const response = await API.post('/admin/add-user', userData);
    return response.data;
  },

  // --- NEW FUNCTIONS (Now fetching Real DB Data) ---

  // 1. Fetch All Faculty
  getAllFaculty: async () => {
    const response = await API.get('/users/faculty-list'); 
    return response.data;
  },

  // 2. Fetch All Courses
  getAllCourses: async () => {
    const response = await API.get('/courses'); 
    return response.data;
  },

  // 3. Assign Faculty to Course
  assignFaculty: async (payload) => {
    // payload = { facultyId, courseId }
    // This now sends real Mongo _id's, fixing the "Cast to ObjectId" error
    const response = await API.post('/admin/assign-faculty', payload);
    return response.data;
  }
};