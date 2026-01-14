import { useState } from "react";
import api from "../../utils/api";
import { Home, UserPlus } from "lucide-react";

const HostelAllocation = () => {
  const [form, setForm] = useState({ 
    studentId: "", 
    hostelName: "Boys Hostel A", // Default or fetch from DB if you have a Hostel List API
    roomNumber: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Matches hostelRoutes.js: router.post("/allocate", ...)
      const { data } = await api.post("/hostel/allocate", form);
      alert(`✅ Success! Room ${data.room.roomNumber} allocated.`);
      setForm({ ...form, studentId: "", roomNumber: "" }); // Reset fields
    } catch (err) {
      alert(err.response?.data?.error || "Allocation Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-6 text-indigo-700">
          <Home size={28} />
          <h2 className="text-2xl font-bold">Hostel Room Allocation</h2>
        </div>

        <form onSubmit={handleAllocate} className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hostel Name</label>
            <select 
              className="w-full p-2 border rounded"
              value={form.hostelName}
              onChange={e => setForm({...form, hostelName: e.target.value})}
            >
              <option>Boys Hostel A</option>
              <option>Girls Hostel B</option>
              {/* Add more hardcoded options or fetch from DB */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Room Number</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              placeholder="e.g. 101"
              value={form.roomNumber}
              onChange={e => setForm({...form, roomNumber: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Student User ID</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              placeholder="Enter Student ID"
              value={form.studentId}
              onChange={e => setForm({...form, studentId: e.target.value})}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Found in User Management tab</p>
          </div>

          <button 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition"
          >
            <UserPlus size={20} />
            {loading ? "Allocating..." : "Allocate Room"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default HostelAllocation;