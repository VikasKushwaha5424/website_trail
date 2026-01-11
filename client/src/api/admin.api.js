import api from './axiosConfig'; // ✅ Import the centralized instance

export const adminAPI = {
  
  // 1. Add New User (Student/Faculty)
  addUser: async (userData) => {
    // Uses 'api' which automatically attaches the 'Authorization: Bearer token' header
    const response = await api.post('/admin/add-user', userData);
    return response.data;
  },

  // 2. Fetch All Faculty (for Dropdowns)
  getAllFaculty: async () => {
    const response = await api.get('/users/faculty-list'); 
    return response.data;
  },

  // 3. Fetch All Courses (for Dropdowns)
  getAllCourses: async () => {
    const response = await api.get('/courses'); 
    return response.data;
  },

  // 4. Assign Faculty to Course
  assignFaculty: async (payload) => {
    // payload = { facultyId, courseId }
    const response = await api.post('/admin/assign-faculty', payload);
    return response.data;
  }
};