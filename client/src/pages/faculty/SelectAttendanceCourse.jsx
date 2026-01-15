import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { ArrowRight, CheckSquare } from "lucide-react";

const SelectAttendanceCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the faculty's courses
    api.get("/faculty/courses") 
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Failed to load courses", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your classes...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckSquare className="text-blue-600" /> Mark Attendance
        </h1>
        <p className="text-gray-500">Select a course below to record today's attendance.</p>
      </header>
      
      {courses.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-xl border border-dashed border-gray-300 text-center">
          <p className="text-gray-400">You are not assigned to any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition">
                    {course.courseId?.name}
                  </h3>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {course.courseId?.code}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {course.semesterId?.name}
                </span>
              </div>
              
              <Link 
                to={`/faculty/attendance/${course._id}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition"
              >
                Open Register <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectAttendanceCourse;