import { useState, useEffect } from "react";
import api from "../../utils/api";

const ViewResults = () => {
  const [results, setResults] = useState([]); // Array of mark objects
  const [sgpa, setSgpa] = useState(0);
  const [semesterId, setSemesterId] = useState("ACTIVE_SEMESTER_ID_HERE"); // Ideally fetch active sem

  useEffect(() => {
    if (!semesterId) return;
    
    api.get(`/marks/my-results?semesterId=${semesterId}`)
      .then(res => {
        setResults(res.data.marks);
        setSgpa(res.data.sgpa);
      })
      .catch(err => console.error(err));
  }, [semesterId]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Academic Performance</h2>

      {/* GPA Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center">
        <div>
          <h3 className="text-lg opacity-90">Current SGPA</h3>
          <p className="text-4xl font-bold">{sgpa || "0.00"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-75">Semester Result</p>
          <p className="font-semibold">Published</p>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Subject</th>
              <th className="p-4">Exam</th>
              <th className="p-4">Score</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-500">Results not yet published.</td></tr>
            ) : (
              results.map(r => (
                <tr key={r._id} className="border-b">
                  <td className="p-4 font-semibold">{r.courseOfferingId.courseId.name}</td>
                  <td className="p-4 text-sm text-gray-600">{r.examType}</td>
                  <td className="p-4">
                    <span className="font-bold text-gray-800">{r.marksObtained}</span> 
                    <span className="text-gray-400 text-sm"> / {r.maxMarks}</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                      PASS
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