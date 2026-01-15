import { useState, useEffect } from "react";
import api from "../../utils/api";
import { BookOpen, UserCheck, AlertCircle } from "lucide-react";

const ElectiveSelector = () => {
  const [electives, setElectives] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [semester, setSemester] = useState("FALL2025"); // Hardcoded or fetch active sem

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/electives/list?semesterId=${semester}`);
      setElectives(data.electives);
      setMyCourses(data.myCourseIds);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEnroll = async (offeringId) => {
    try {
      await api.post("/electives/enroll", { offeringId });
      alert("Enrolled Successfully!");
      fetchData(); // Refresh seat counts
    } catch (err) {
      alert(err.response?.data?.error || "Failed to enroll");
    }
  };

  const handleDrop = async (offeringId) => {
    if(!confirm("Are you sure you want to drop this course?")) return;
    try {
      await api.post("/electives/drop", { offeringId });
      alert("Dropped Successfully");
      fetchData();
    } catch (err) { alert("Failed to drop"); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="text-indigo-600" /> Elective Registration ({semester})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {electives.map((item) => {
          const isEnrolled = myCourses.includes(item._id);
          const isFull = item.enrolledCount >= item.maxSeats;
          const percentage = (item.enrolledCount / item.maxSeats) * 100;

          return (
            <div key={item._id} className={`bg-white rounded-xl shadow border-t-4 p-5 flex flex-col justify-between ${isEnrolled ? "border-green-500" : isFull ? "border-red-400 opacity-75" : "border-indigo-500"}`}>
              
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.courseId.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.courseId.code}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Prof. {item.facultyId.lastName}</p>
                
                {/* Seat Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span>Seats: {item.enrolledCount} / {item.maxSeats}</span>
                    <span className={isFull ? "text-red-500" : "text-green-600"}>
                      {isFull ? "FULL" : "OPEN"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${isFull ? "bg-red-500" : "bg-indigo-600"}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                {isEnrolled ? (
                  <button 
                    onClick={() => handleDrop(item._id)}
                    className="w-full py-2 rounded border border-red-500 text-red-500 font-bold hover:bg-red-50"
                  >
                    Drop Course
                  </button>
                ) : (
                  <button 
                    onClick={() => handleEnroll(item._id)}
                    disabled={isFull}
                    className={`w-full py-2 rounded text-white font-bold flex justify-center items-center gap-2 ${
                      isFull ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isFull ? <><AlertCircle size={18}/> Class Full</> : <><UserCheck size={18}/> Enroll Now</>}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
      
      {electives.length === 0 && (
        <div className="text-center py-10 text-gray-500">No elective courses available for registration at this time.</div>
      )}
    </div>
  );
};

export default ElectiveSelector;