import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { Mail } from "lucide-react"; // 👈 1. Import Icon

const AttendanceEntry = () => {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/faculty/course/${offeringId}/students`)
      .then(res => {
        const initialized = res.data.map(s => ({ ...s, status: "PRESENT" }));
        setStudents(initialized);
      })
      .catch(err => alert("Error loading students"));
  }, [offeringId]);

  const toggleStatus = (studentId) => {
    setStudents(prev => prev.map(s => 
      s._id === studentId 
        ? { ...s, status: s.status === "PRESENT" ? "ABSENT" : "PRESENT" } 
        : s
    ));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/faculty/mark-attendance", {
        offeringId,
        date,
        students: students.map(s => ({ studentId: s._id, status: s.status }))
      });
      alert("Attendance Saved Successfully!");
      navigate("/faculty/courses");
    } catch (err) {
      alert("Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mark Attendance</h2>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="border p-2 rounded shadow-sm"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Name</th>
              <th className="p-4 text-center">Contact</th> {/* 👈 2. New Column */}
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600 font-mono">{student.rollNumber}</td>
                <td className="p-4 font-medium">{student.name}</td>
                
                {/* 👈 3. The Email Button */}
                <td className="p-4 text-center">
                  <a 
                    href={`mailto:${student.email}?subject=Class Update: Attendance Warning`}
                    className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title={`Email ${student.name}`}
                  >
                    <Mail size={18} />
                  </a>
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleStatus(student._id)}
                    className={`px-4 py-1 rounded-full font-bold text-sm transition-colors w-24 ${
                      student.status === "PRESENT" 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {student.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save Attendance Record"}
      </button>
    </div>
  );
};

export default AttendanceEntry;