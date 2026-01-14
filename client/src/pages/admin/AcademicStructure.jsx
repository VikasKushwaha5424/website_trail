import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Trash, Edit, Plus, X } from "lucide-react";

const AcademicStructure = () => {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Forms
  const [newDept, setNewDept] = useState({ name: "", code: "" });
  
  // Course Form State (Used for BOTH Add and Edit)
  const [courseForm, setCourseForm] = useState({ 
    id: null, // If null, we are adding. If set, we are editing.
    name: "", code: "", credits: 3, departmentId: "" 
  });
  
  const [isEditingCourse, setIsEditingCourse] = useState(false);

  const fetchData = async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        api.get("/admin/departments"),
        api.get("/admin/courses")
      ]);
      setDepartments(deptRes.data);
      setCourses(courseRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Handlers ---

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/add-department", newDept);
      setNewDept({ name: "", code: "" });
      fetchData();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingCourse) {
        // ✏️ UPDATE LOGIC
        await api.put("/admin/update-course", {
          courseId: courseForm.id,
          name: courseForm.name,
          code: courseForm.code,
          credits: courseForm.credits,
          departmentId: courseForm.departmentId
        });
      } else {
        // ➕ ADD LOGIC
        await api.post("/admin/add-course", courseForm);
      }
      resetCourseForm();
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Operation failed"); }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete("/admin/delete-course", { data: { courseId } });
      fetchData();
    } catch (err) { alert(err.response?.data?.error || "Cannot delete course"); }
  };

  // --- Helpers ---

  const startEditCourse = (course) => {
    setCourseForm({
      id: course._id,
      name: course.name,
      code: course.code,
      credits: course.credits,
      departmentId: course.departmentId?._id || "" // Handle populated field
    });
    setIsEditingCourse(true);
  };

  const resetCourseForm = () => {
    setCourseForm({ id: null, name: "", code: "", credits: 3, departmentId: "" });
    setIsEditingCourse(false);
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* LEFT: Departments */}
      <div className="bg-white p-6 rounded shadow h-fit">
        <h2 className="text-xl font-bold mb-4">Departments</h2>
        <ul className="mb-6 space-y-2">
          {departments.map(d => (
            <li key={d._id} className="flex justify-between p-3 bg-gray-50 rounded">
              <span>{d.name}</span>
              <span className="font-mono bg-gray-200 px-2 rounded text-sm">{d.code}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddDept} className="border-t pt-4">
          <h3 className="font-semibold mb-2">Add Department</h3>
          <div className="flex gap-2">
            <input placeholder="Name" className="border p-2 rounded flex-1" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} required />
            <input placeholder="Code" className="border p-2 rounded w-24" value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} required />
            <button className="bg-green-600 text-white px-4 rounded">Add</button>
          </div>
        </form>
      </div>

      {/* RIGHT: Courses (With Edit) */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Courses</h2>
          {isEditingCourse && (
            <button onClick={resetCourseForm} className="text-xs text-red-500 flex items-center gap-1">
              <X size={14}/> Cancel Edit
            </button>
          )}
        </div>

        {/* Course Form (Dynamic Title) */}
        <form onSubmit={handleCourseSubmit} className="bg-blue-50 p-4 rounded mb-6 border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            {isEditingCourse ? <Edit size={16}/> : <Plus size={16}/>} 
            {isEditingCourse ? "Edit Course" : "Add New Course"}
          </h3>
          <div className="grid gap-2">
            <input placeholder="Course Name" className="border p-2 rounded bg-white" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Code" className="border p-2 rounded bg-white" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} required />
              <input type="number" placeholder="Credits" className="border p-2 rounded bg-white" value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: e.target.value})} required />
            </div>
            <select className="border p-2 rounded bg-white" value={courseForm.departmentId} onChange={e => setCourseForm({...courseForm, departmentId: e.target.value})} required>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <button className={`p-2 rounded text-white font-bold ${isEditingCourse ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"}`}>
              {isEditingCourse ? "Update Course" : "Create Course"}
            </button>
          </div>
        </form>
        
        {/* List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {courses.map(c => (
            <div key={c._id} className={`flex justify-between items-center p-3 rounded border-l-4 ${isEditingCourse && courseForm.id === c._id ? "bg-orange-50 border-orange-500" : "bg-gray-50 border-blue-500"}`}>
              <div>
                <p className="font-bold">{c.name} <span className="text-xs text-gray-500">({c.code})</span></p>
                <p className="text-xs text-gray-400">{c.departmentId?.name} • {c.credits} Credits</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEditCourse(c)} className="text-blue-500 hover:bg-blue-100 p-1 rounded"><Edit size={16} /></button>
                <button onClick={() => handleDeleteCourse(c._id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default AcademicStructure;