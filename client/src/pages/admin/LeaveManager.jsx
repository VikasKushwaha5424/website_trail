import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Check, X } from "lucide-react";

const LeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("PENDING");

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get(`/leaves/all?status=${filter}`);
      setLeaves(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchLeaves(); }, [filter]);

  const handleAction = async (leaveId, status) => {
    const comment = prompt(status === "REJECTED" ? "Reason for rejection?" : "Add a note (optional):");
    try {
      await api.post("/leaves/update-status", { leaveId, status, adminComment: comment });
      fetchLeaves();
    } catch (err) { alert("Action Failed"); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Faculty Leave Requests</h2>
        <div className="flex bg-white rounded shadow p-1">
          {["PENDING", "APPROVED", "REJECTED"].map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm rounded ${filter === status ? "bg-blue-600 text-white font-bold" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leaves.map(leave => (
          <div key={leave._id} className="bg-white p-5 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{leave.facultyId.firstName} {leave.facultyId.lastName}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{leave.facultyId.designation}</p>
              </div>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{leave.leaveType}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-semibold text-gray-700">
                {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-1 italic">"{leave.reason}"</p>
            </div>

            {filter === "PENDING" && (
              <div className="flex gap-2 mt-4 border-t pt-3">
                <button 
                  onClick={() => handleAction(leave._id, "APPROVED")}
                  className="flex-1 bg-green-50 text-green-700 py-2 rounded font-bold hover:bg-green-100 flex items-center justify-center gap-2"
                >
                  <Check size={18}/> Approve
                </button>
                <button 
                  onClick={() => handleAction(leave._id, "REJECTED")}
                  className="flex-1 bg-red-50 text-red-700 py-2 rounded font-bold hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <X size={18}/> Reject
                </button>
              </div>
            )}
            
            {filter !== "PENDING" && leave.adminComment && (
              <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                <strong>Admin Note:</strong> {leave.adminComment}
              </div>
            )}
          </div>
        ))}
        {leaves.length === 0 && <p className="text-gray-500 col-span-2 text-center py-10">No requests found.</p>}
      </div>
    </div>
  );
};

export default LeaveManager;