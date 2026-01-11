import api from './axiosConfig';

export const facultyAPI = {
  // 1. Get My Classes
  getColors: async () => { // Renamed for clarity in UI, keeps consistency
    const response = await api.get('/faculty/courses');
    return response.data;
  },

  // 2. Get Students by Course ID
  getStudents: async (courseId) => {
    const response = await api.get(`/faculty/courses/${courseId}/students`);
    return response.data;
  },

  // 3. Submit Attendance
  markAttendance: async (data) => {
    // data = { courseId, date, students: [...] }
    const response = await api.post('/faculty/attendance', data);
    return response.data;
  }
};