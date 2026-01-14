import { useState, useEffect } from "react";
import api from "../../utils/api";

const MarksEntry = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [examType, setExamType] = useState("MID_TERM");
  const [maxMarks, setMaxMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: marks }

  // 1. Fetch Faculty's Courses
  useEffect(() => {
    // You likely have a route for this, or reuse existing
    api.get("/faculty/my-courses").then(res => setCourses(res.data));
  }, []);

  // 2. Fetch Students & Existing Marks when selections change
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchData = async () => {
      try {
        // Get Students
        const classRes = await api.get(`/marks/class-list?courseOfferingId=${selectedCourse}`);
        setStudents(classRes.data);

        // Get Existing Marks (Pre-fill)
        const marksRes = await api.get(`/marks/faculty-view?courseOfferingId=${selectedCourse}&examType=${examType}`);
        
        const mapping = {};
        marksRes.data.forEach(m => {
          mapping[m.studentId] = m.marksObtained;
        });
        setMarksData(mapping);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [selectedCourse, examType]);

  // Handle Input Change
  const handleMarkChange = (studentId, val) => {
    setMarksData(prev => ({ ...prev, [studentId]: val }));
  };

  // Save Single Mark (On Blur or Button)
  const saveMark = async (studentId) => {
    try {
      await api.post("/marks/update", {
        studentId,
        courseOfferingId: selectedCourse,
        examType,
        marksObtained: marksData[studentId],
        maxMarks
      });
      // Optional: Show small success indicator
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Enter Student Marks</h2>
      
      <div className="flex gap-4 mb-6 bg-white p-4 rounded shadow">
        <select className="border p-2 rounded" onChange={e => setSelectedCourse(e.target.value)}>
          <option value="">Select Course</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.courseId?.name} ({c.section})</option>)}
        </select>

        <select className="border p-2 rounded" value={examType} onChange={e => setExamType(e.target.value)}>
          <option value="INTERNAL_1">Internal 1</option>
          <option value="MID_TERM">Mid Term</option>
          <option value="INTERNAL_2">Internal 2</option>
          <option value="FINAL">Final Exam</option>
          <option value="LAB">Lab</option>
        </select>

        <input 
          type="number" 
          placeholder="Max Marks" 
          className="border p-2 rounded w-24"
          value={maxMarks}
          onChange={e => setMaxMarks(e.target.value)}
        />
      </div>

      {selectedCourse && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Marks Obtained</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(enrollment => {
                const s = enrollment.studentId;
                return (
                  <tr key={s._id} className="border-b">
                    <td className="p-4">{s.rollNumber}</td>
                    <td className="p-4">{s.firstName} {s.lastName}</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        className="border p-2 rounded w-20"
                        value={marksData[s._id] || ""}
                        onChange={e => handleMarkChange(s._id, e.target.value)}
                      />
                      <span className="text-gray-400 ml-2">/ {maxMarks}</span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => saveMark(s._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && <div className="p-6 text-center text-gray-500">No students enrolled.</div>}
        </div>
      )}
    </div>
  );
};

export default MarksEntry;