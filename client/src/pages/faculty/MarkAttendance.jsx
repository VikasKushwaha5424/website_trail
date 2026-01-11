import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../../api/faculty.api';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Courses on Load
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await facultyAPI.getColors();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    loadCourses();
  }, []);

  // 2. Fetch Students when Course Changes
  useEffect(() => {
    if (!selectedCourse) return;
    
    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await facultyAPI.getStudents(selectedCourse);
        // Add a 'status' field to each student for UI handling
        const initialized = data.map(s => ({
          studentId: s._id,
          name: s.userId.name,
          rollNo: s.rollNo,
          status: 'Present' // Default status
        }));
        setStudents(initialized);
      } catch (err) {
        alert("Error loading students");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedCourse]);

  // Toggle Status (Present <-> Absent)
  const toggleStatus = (index) => {
    const updated = [...students];
    updated[index].status = updated[index].status === 'Present' ? 'Absent' : 'Present';
    setStudents(updated);
  };

  // Submit Data
  const handleSubmit = async () => {
    if (!selectedCourse) return alert("Select a course first!");
    
    try {
      await facultyAPI.markAttendance({
        courseId: selectedCourse,
        date,
        students: students.map(s => ({ studentId: s.studentId, status: s.status }))
      });
      alert("✅ Attendance Saved Successfully!");
    } catch (err) {
      alert("❌ Failed to save.");
    }
  };

  return (
    <div className="attendance-container">
      <h2>📝 Mark Attendance</h2>

      <div className="controls">
        {/* Course Select */}
        <select onChange={(e) => setSelectedCourse(e.target.value)} value={selectedCourse}>
          <option value="">-- Select Course --</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Date Picker */}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {selectedCourse && (
        <div className="student-list">
            <div className="list-header">
                <span>Roll No</span>
                <span>Name</span>
                <span>Status</span>
            </div>

            {loading ? <p>Loading students...</p> : students.map((student, index) => (
                <div key={student.studentId} className={`list-row ${student.status.toLowerCase()}`}>
                    <span>{student.rollNo}</span>
                    <span>{student.name}</span>
                    <button 
                        className={`status-btn ${student.status}`} 
                        onClick={() => toggleStatus(index)}
                    >
                        {student.status}
                    </button>
                </div>
            ))}

            <button className="save-btn" onClick={handleSubmit}>💾 Save Attendance</button>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;