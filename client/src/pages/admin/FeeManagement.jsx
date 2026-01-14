import { useState, useEffect } from "react";
import api from "../../utils/api";
import { CheckCircle, XCircle } from "lucide-react";

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingPayments, setPendingPayments] = useState([]);
  const [feeForm, setFeeForm] = useState({ amount: "", type: "TUITION", dueDate: "", departmentId: "" });

  useEffect(() => {
    if (activeTab === "pending") {
      api.get("/admin/fees/pending").then(res => setPendingPayments(res.data.data));
    }
  }, [activeTab]);

  const handleVerify = async (paymentId, action) => {
    try {
      await api.post("/admin/fees/verify", { paymentId, action });
      setPendingPayments(prev => prev.filter(p => p._id !== paymentId));
    } catch (err) { alert("Action failed"); }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      // Note: 'semesterId' usually comes from the active semester logic, hardcoded or fetched here.
      // For simplicity, we assume the backend handles it or we send a dummy if permitted.
      await api.post("/admin/fees/assign", { ...feeForm, semesterId: "ACTIVE_SEMESTER_ID" }); 
      alert("Fees Assigned Successfully");
    } catch (err) { alert(err.response?.data?.message); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Finance & Fee Management</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setActiveTab("pending")} className={`pb-2 ${activeTab === "pending" ? "border-b-2 border-blue-600 font-bold" : ""}`}>Pending Approvals</button>
        <button onClick={() => setActiveTab("assign")} className={`pb-2 ${activeTab === "assign" ? "border-b-2 border-blue-600 font-bold" : ""}`}>Assign Fees</button>
      </div>

      {/* Tab Content: Pending */}
      {activeTab === "pending" && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.map(p => (
                <tr key={p._id} className="border-b">
                  <td className="p-4">{p.studentId?.firstName} {p.studentId?.lastName} <br/><span className="text-xs text-gray-500">{p.studentId?.rollNumber}</span></td>
                  <td className="p-4 font-bold text-green-600">${p.amount}</td>
                  <td className="p-4 text-xs uppercase">{p.feeId?.type}</td>
                  <td className="p-4 text-sm font-mono">{p.transactionHash}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleVerify(p._id, "APPROVE")} className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle/></button>
                    <button onClick={() => handleVerify(p._id, "REJECT")} className="text-red-600 hover:bg-red-50 p-1 rounded"><XCircle/></button>
                  </td>
                </tr>
              ))}
              {pendingPayments.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No pending payments.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Assign */}
      {activeTab === "assign" && (
        <div className="max-w-xl bg-white p-6 rounded shadow">
          <h3 className="text-lg font-bold mb-4">Bulk Assign Fees</h3>
          <form onSubmit={handleCreateFee} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Fee Type</label>
              <select className="w-full border p-2 rounded" onChange={e => setFeeForm({...feeForm, type: e.target.value})}>
                <option>TUITION</option>
                <option>LIBRARY</option>
                <option>HOSTEL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Amount</label>
              <input type="number" className="w-full border p-2 rounded" onChange={e => setFeeForm({...feeForm, amount: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Due Date</label>
              <input type="date" className="w-full border p-2 rounded" onChange={e => setFeeForm({...feeForm, dueDate: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Department ID (Optional Filter)</label>
              <input className="w-full border p-2 rounded" placeholder="Leave blank for all students" onChange={e => setFeeForm({...feeForm, departmentId: e.target.value})} />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Generate Fee Records</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default FeeManagement;