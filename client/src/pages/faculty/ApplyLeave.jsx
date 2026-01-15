import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Calendar, Clock } from "lucide-react";

const ApplyLeave = () => {
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/leaves/my-history");
      setHistory(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leaves/apply", form);
      alert("Leave Request Submitted!");
      setForm({ leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to apply");
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Apply Form */}
      <div className="md:col-span-1 bg-white p-6 rounded-xl shadow h-fit">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600"/> Apply Leave
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
            <select 
              className="w-full border p-2 rounded" 
              value={form.leaveType}
              onChange={e => setForm({...form, leaveType: e.target.value})}
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="OFFICIAL">Official Duty</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">From</label>
              <input type="date" className="w-full border p-2 rounded" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">To</label>
              <input type="date" className="w-full border p-2 rounded" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Reason</label>
            <textarea 
              className="w-full border p-2 rounded h-24" 
              placeholder="Reason for leave..."
              value={form.reason}
              onChange={e => setForm({...form, reason: e.target.value})}
              required
            />
          </div>

          <button className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Submit Request</button>
        </form>
      </div>

      {/* History List */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="text-gray-600"/> My Leave History
        </h2>
        
        <div className="space-y-3">
          {history.length === 0 ? <p className="text-gray-500">No leave history found.</p> : (
            history.map(leave => (
              <div key={leave._id} className="bg-white p-4 rounded shadow border-l-4 flex justify-between items-center relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  leave.status === "APPROVED" ? "bg-green-500" : 
                  leave.status === "REJECTED" ? "bg-red-500" : "bg-yellow-400"
                }`}></div>
                
                <div className="pl-2">
                  <h4 className="font-bold">{leave.leaveType} <span className="text-xs text-gray-400 ml-2">{new Date(leave.appliedAt).toLocaleDateString()}</span></h4>
                  <p className="text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 italic mt-1">"{leave.reason}"</p>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    leave.status === "APPROVED" ? "bg-green-100 text-green-700" : 
                    leave.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {leave.status}
                  </span>
                  {leave.adminComment && <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate">Note: {leave.adminComment}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ApplyLeave;