import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Loader, Award } from "lucide-react";

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple Client-Side SGPA Calculation Logic
  // (You can adjust the grading logic here to match your university's rules)
  const calculateSGPA = (marks) => {
    if (!marks || marks.length === 0) return "0.00";
    
    const totalPoints = marks.reduce((acc, curr) => {
       const score = Number(curr.obtained);
       const max = Number(curr.max);
       const percentage = (score / max) * 100;
       
       let points = 0;
       if (percentage >= 90) points = 10;
       else if (percentage >= 80) points = 9;
       else if (percentage >= 70) points = 8;
       else if (percentage >= 60) points = 7;
       else if (percentage >= 50) points = 6;
       // Else 0 (Fail)

       return acc + points;
    }, 0);

    return (totalPoints / marks.length).toFixed(2);
  };

  useEffect(() => {
    // Matches the updated route in studentRoutes.js
    api.get("/student/marks") 
      .then(res => {
        setResults(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch results:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex justify-center items-center text-gray-500 gap-2">
        <Loader className="animate-spin" /> Loading Results...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="text-blue-600" /> Academic Performance
        </h2>
      </header>

      {/* GPA Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center">
        <div>
          <h3 className="text-lg opacity-90 font-medium">Estimated SGPA</h3>
          <p className="text-4xl font-bold mt-1">{calculateSGPA(results)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-75">Status</p>
          <p className="font-semibold text-lg">{results.length > 0 ? "Published" : "Pending"}</p>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Subject Code</th>
              <th className="p-4 font-semibold text-gray-600">Subject Name</th>
              <th className="p-4 font-semibold text-gray-600">Exam Type</th>
              <th className="p-4 font-semibold text-gray-600">Score</th>
              <th className="p-4 font-semibold text-gray-600">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic bg-gray-50">
                  No results available yet. Check back later!
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r._id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 text-gray-500 font-mono text-sm">{r.code}</td>
                  <td className="p-4 font-bold text-gray-800">{r.subject}</td>
                  <td className="p-4 text-sm text-blue-600 font-medium">{r.exam}</td>
                  <td className="p-4">
                    <span className="font-bold text-gray-900">{r.obtained}</span> 
                    <span className="text-gray-400 text-xs"> / {r.max}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      parseFloat(r.percentage) >= 40 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {parseFloat(r.percentage) >= 40 ? "PASS" : "FAIL"}
                    </span>
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

export default ViewResults;