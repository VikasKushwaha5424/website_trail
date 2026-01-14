import { useState, useEffect } from "react";
import api from "../../utils/api";

const ClassOperations = () => {
  // Data for Dropdowns
  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Forms
  const [semester, setSemester] = useState({ name: "", code: "", startDate: "", endDate: "", isActive: true });
  const [assign, setAssign] = useState({ facultyId: "", courseId: "", semesterId: "" }); // semesterId optional (defaults to active)
  const [enroll, setEnroll] = useState({ studentId: "", courseOfferingId: "" });

  useEffect(() => {
    // Load options
    api.get("/admin/users?role=faculty&limit=100").then(res => setFacultyList(res.data.data));
    api.get("/admin/courses").then(res => setCourses(res.data.data));
  }, []);

  // 1. Semester Handler
  const handleCreateSemester = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/create-semester", semester);
      alert("Semester Created!");
    } catch (err) { alert(err.response?.data?.error); }
  };

  // 2. Assign Faculty Handler
  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/assign-faculty", assign);
      alert("Faculty Assigned Successfully!");
    } catch (err) { alert(err.response?.data?.message); }
  };

  // 3. Enroll Student Handler
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/enroll-student", enroll);
      alert("Student Enrolled Manually!");
    } catch (err) { alert(err.response?.data?.message); }
  };

  return (
    <div className="p-6 space-y-8">
      
      {/* Section 1: Create Semester */}
      <section className="bg-white p-6 rounded shadow border-l-4 border-green-500">
        <h2 className="text-xl font-bold mb-4">Start New Semester</h2>
        <form onSubmit={handleCreateSemester} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Semester Name (e.g. Fall 2025)" className="border p-2 rounded" onChange={e => setSemester({...semester, name: e.target.value})} required />
          <input placeholder="Code (e.g. F25)" className="border p-2 rounded" onChange={e => setSemester({...semester, code: e.target.value})} required />
          <div className="flex gap-2 items-center">
            <span className="text-sm">Start:</span>
            <input type="date" className="border p-2 rounded flex-1" onChange={e => setSemester({...semester, startDate: e.target.value})} required />
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm">End:</span>
            <input type="date" className="border p-2 rounded flex-1" onChange={e => setSemester({...semester, endDate: e.target.value})} required />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={semester.isActive} onChange={e => setSemester({...semester, isActive: e.target.checked})} />
            <label>Set as Active Semester (Deactivates others)</label>
          </div>
          <button className="bg-green-600 text-white py-2 rounded md:col-span-2">Create Semester</button>
        </form>
      </section>

      {/* Section 2: Assign Faculty */}
      <section className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Assign Faculty to Course</h2>
        <form onSubmit={handleAssignFaculty} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="border p-2 rounded" onChange={e => setAssign({...assign, facultyId: e.target.value})} required>
            <option value="">Select Faculty</option>
            {facultyList.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
          </select>
          <select className="border p-2 rounded" onChange={e => setAssign({...assign, courseId: e.target.value})} required>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
          </select>
          <button className="bg-blue-600 text-white py-2 rounded">Assign</button>
        </form>
      </section>

      {/* Section 3: Manual Enrollment (Advanced) */}
      <section className="bg-white p-6 rounded shadow border-l-4 border-orange-500">
        <h2 className="text-xl font-bold mb-4">Manual Student Enrollment</h2>
        <p className="text-sm text-gray-500 mb-4">Use this to force-add a student to a class (Course Offering).</p>
        <form onSubmit={handleEnrollStudent} className="flex gap-4">
          <input placeholder="Student User ID" className="border p-2 rounded flex-1" onChange={e => setEnroll({...enroll, studentId: e.target.value})} required />
          <input placeholder="Course Offering ID" className="border p-2 rounded flex-1" onChange={e => setEnroll({...enroll, courseOfferingId: e.target.value})} required />
          <button className="bg-orange-600 text-white px-6 rounded">Enroll</button>
        </form>
      </section>

    </div>
  );
};
export default ClassOperations;