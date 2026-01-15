import { useState, useEffect } from "react";
import api from "../../utils/api";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const BatchPromotion = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ departmentId: "", fromSemester: "1" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch Departments for Dropdown
  useEffect(() => {
    api.get("/admin/departments").then(res => setDepartments(res.data));
  }, []);

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to promote all Semester ${form.fromSemester} students? This cannot be undone easily.`)) return;

    setLoading(true);
    setSuccessMsg("");
    try {
      const { data } = await api.post("/admin/promote", form);
      setSuccessMsg(data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Promotion Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
        <div className="flex items-center gap-3 mb-6 text-indigo-800">
          <TrendingUp size={32} />
          <h2 className="text-2xl font-bold">Batch Promotion</h2>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex gap-2">
            <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> This action will bulk update student profiles. 
              Students in <strong>Semester 8</strong> will be marked as <strong>GRADUATED</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handlePromote} className="space-y-6">
          
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department (Optional)</label>
            <select 
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.departmentId}
              onChange={e => setForm({...form, departmentId: e.target.value})}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Leave blank to promote the entire college batch.</p>
          </div>

          {/* Semester Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Semester to Promote</label>
            <select 
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.fromSemester}
              onChange={e => setForm({...form, fromSemester: e.target.value})}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem} {sem === 8 ? "(Graduating Batch)" : ""}</option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? "Processing..." : (
              <>
                Promote Batch <TrendingUp size={20} />
              </>
            )}
          </button>

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2 animate-pulse">
              <CheckCircle size={20} />
              {successMsg}
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default BatchPromotion;