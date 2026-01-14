import { useState, useEffect } from "react";
import api from "../../utils/api";
import { ClipboardCheck } from "lucide-react";

const AttendanceMonitor = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceList, setAttendanceList] = useState([]);

  // 1. Fetch All Active Courses on Load
  useEffect(() => {
    api.get("/admin/courses").then(res => setCourses(res.data.data));
  }, []);

  // 2. Fetch Attendance when Course/Date changes
  useEffect(() => {
    if (!selectedCourse) return;
    fetchAttendance();
  }, [selectedCourse, date]);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get(`/admin/attendance?courseOfferingId=${selectedCourse}&date=${date}`);
      setAttendanceList(data);
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await api.post("/admin/attendance/fix", {
        studentId,
        courseOfferingId: selectedCourse,
        date,
        status: newStatus
      });
      fetchAttendance(); // Refresh UI
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ClipboardCheck className="text-green-600"/> Attendance Monitor
      </h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6 flex gap-4">
        <select className="border p-2 rounded flex-1" onChange={e => setSelectedCourse(e.target.value)}>
          <option value="">Select Course...</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
        </select>
        <input 
          type="date" 
          className="border p-2 rounded" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
        />
      </div>

      {/* List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Roll No</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-500">No records found or no course selected.</td></tr>
            ) : (
              attendanceList.map((item) => (
                <tr key={item.student._id} className="border-b">
                  <td className="p-4 font-bold">{item.student.firstName} {item.student.lastName}</td>
                  <td className="p-4 text-gray-500">{item.student.rollNumber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.status === "PRESENT" ? "bg-green-100 text-green-700" :
                      item.status === "ABSENT" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select 
                      className="border p-1 rounded text-sm"
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.student._id, e.target.value)}
                    >
                      <option value="PRESENT">Mark Present</option>
                      <option value="ABSENT">Mark Absent</option>
                      <option value="LATE">Mark Late</option>
                      <option value="EXCUSED">Excused</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceMonitor;