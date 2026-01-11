import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin.api';
import './AddUser.css'; // Re-using existing CSS

const AssignFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    facultyId: '',
    courseId: ''
  });

  // --- 1. Load Data on Page Load ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const faculty = await adminAPI.getAllFaculty();
        const courses = await adminAPI.getAllCourses();

        setFacultyList(faculty);
        setCourseList(courses);
        
        // --- SMART DEFAULTS ---
        // Automatically select the first item so the user doesn't send empty data
        setFormData({
            facultyId: faculty.length > 0 ? faculty[0]._id : '',
            courseId: courses.length > 0 ? courses[0]._id : ''
        });

      } catch (err) {
        console.error("Error loading data:", err);
        alert("Failed to load dropdown data.");
      }
    };
    fetchData();
  }, []);

  // --- 2. Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Safety Check
    if (!formData.facultyId || !formData.courseId) {
        alert("Please select both a Faculty and a Course.");
        setLoading(false);
        return;
    }

    try {
      console.log("Submitting Payload:", formData); // Debugging log
      await adminAPI.assignFaculty(formData);
      alert("✅ Faculty Assigned Successfully!");
    } catch (error) {
      console.error("Assign Error:", error);
      alert("❌ Error: " + (error.response?.data?.message || "Failed to assign"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>🔗 Assign Faculty</h2>
        <p>Link a professor to a specific course.</p>

        <form onSubmit={handleSubmit}>
          
          {/* --- FACULTY DROPDOWN --- */}
          <div className="form-group">
            <label>Select Faculty</label>
            <select 
              value={formData.facultyId}
              onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
              required
            >
              {facultyList.map(fac => (
                <option key={fac._id} value={fac._id}>
                  {/* Shows: "Dr. Smith (FAC001)" */}
                  {fac.name} ({fac.rollNumber}) 
                </option>
              ))}
            </select>
          </div>

          {/* --- COURSE DROPDOWN --- */}
          <div className="form-group">
            <label>Select Course</label>
            <select 
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              required
            >
              {courseList.map(course => (
                <option key={course._id} value={course._id}>
                   {/* Shows: "Intro to Programming (CS101)" */}
                  {course.name || course.subjectName} ({course.code || course.subjectCode})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Assigning..." : "Link Faculty to Course"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AssignFaculty;