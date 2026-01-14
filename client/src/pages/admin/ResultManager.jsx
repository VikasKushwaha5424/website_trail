import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Lock } from "lucide-react";

const ResultManager = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSem, setSelectedSem] = useState("");

  useEffect(() => {
    // Reuse your existing public endpoint or fetch semesters
    // Assuming you have a route to get all semesters
    // For now, this is a placeholder fetch
    // api.get("/public/semesters").then(res => setSemesters(res.data));
  }, []);

  const handlePublish = async () => {
    if (!selectedSem) return;
    if (!confirm("Are you sure? This will LOCK all marks for this semester and make them visible to students.")) return;

    try {
      await api.post("/marks/publish", { semesterId: selectedSem });
      alert("Results Published Successfully!");
    } catch (err) {
      alert("Failed to publish results");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
        <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Lock className="text-red-600" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Publish Results</h2>
        <p className="text-gray-500 mb-6">Select a semester to finalize marks. Once published, faculty cannot edit grades.</p>

        {/* Semester Selector Placeholder - Replace with dynamic list */}
        <select 
          className="w-full p-3 border rounded mb-4"
          onChange={e => setSelectedSem(e.target.value)}
        >
          <option value="">Select Semester</option>
          {/* Example Hardcoded ID for testing if API not ready */}
          <option value="ACTIVE_SEMESTER_ID_HERE">Fall 2025 (Active)</option> 
        </select>

        <button 
          onClick={handlePublish}
          disabled={!selectedSem}
          className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Publish & Lock Grades
        </button>
      </div>
    </div>
  );
};

export default ResultManager;