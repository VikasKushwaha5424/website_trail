import { useState, useEffect } from "react";
import api from "../../utils/api";

const MarksEntry = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [examType, setExamType] = useState("MID_TERM");
  const [maxMarks, setMaxMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: marks }
  const [loading, setLoading] = useState(false);

  // 1. Fetch Faculty's Courses
  useEffect(() => {
    // 🟢 FIXED: Changed from "/faculty/my-courses" to "/faculty/courses"
    api.get("/faculty/courses")
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err));
  }, []);

  // 2. Fetch Students & Existing Marks when selections change
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Get Students for this specific class
        const classRes = await api.get(`/marks/class-list?courseOfferingId=${selectedCourse}`);
        setStudents(classRes.data);

        // Get Existing Marks (Pre-fill)
        const marksRes = await api.get(`/marks/faculty-view?courseOfferingId=${selectedCourse}&examType=${examType}`);
        
        const mapping = {};
        marksRes.data.forEach(m => {
          mapping[m.studentId] = m.marksObtained;
        });
        setMarksData(mapping);
      } catch (err) { 
        console.error(err); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCourse, examType]);

  // Handle Input Change
  const handleMarkChange = (studentId, val) => {
    setMarksData(prev => ({ ...prev, [studentId]: val }));
  };

  // Save Single Mark
  const saveMark = async (studentId) => {
    try {
      await api.post("/marks/update", {
        studentId,
        courseOfferingId: selectedCourse,
        examType,
        marksObtained: marksData[studentId],
        maxMarks
      });
      alert("Mark saved!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gradebook Entry</h2>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Select Course</label>
          <select 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" 
            onChange={e => setSelectedCourse(e.target.value)}
            value={selectedCourse}
          >
            <option value="">-- Choose Class --</option>
            {courses.map(c => (
              <option key={c.offeringId} value={c.offeringId}>
                {c.course?.name} ({c.course?.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Exam Type</label>
          <select 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" 
            value={examType} 
            onChange={e => setExamType(e.target.value)}
          >
            <option value="INTERNAL_1">Internal 1</option>
            <option value="MID_TERM">Mid Term</option>
            <option value="INTERNAL_2">Internal 2</option>
            <option value="FINAL">Final Exam</option>
            <option value="LAB">Lab Evaluation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Max Marks</label>
          <input 
            type="number" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
            value={maxMarks}
            onChange={e => setMaxMarks(e.target.value)}
          />
        </div>
      </div>

      {/* Student List */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading student data...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-indigo-50 text-indigo-900 border-b border-indigo-100">
                <tr>
                  <th className="p-4 font-semibold">Roll No</th>
                  <th className="p-4 font-semibold">Student Name</th>
                  <th className="p-4 font-semibold">Marks Obtained</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(enrollment => {
                  const s = enrollment.studentId; // This depends on your populate structure
                  // Fallback if populate structure is different
                  const name = s?.name || (s?.firstName + " " + s?.lastName); 
                  
                  return (
                    <tr key={s?._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600 font-mono text-sm">{s?.rollNumber}</td>
                      <td className="p-4 font-medium text-gray-800">{name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="border border-gray-300 p-2 rounded w-24 text-center focus:border-indigo-500 outline-none"
                            value={marksData[s?._id] || ""}
                            onChange={e => handleMarkChange(s?._id, e.target.value)}
                            max={maxMarks}
                          />
                          <span className="text-gray-400 text-sm">/ {maxMarks}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => saveMark(s?._id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-transform"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && students.length === 0 && (
            <div className="p-10 text-center text-gray-400 italic">
              No students found for this class.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarksEntry;