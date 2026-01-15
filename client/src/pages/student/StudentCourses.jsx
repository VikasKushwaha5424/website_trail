import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { BookOpen, User, ArrowRight } from "lucide-react";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get("/student/courses");
        setCourses(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your courses...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {courses.length} Active Subjects
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">You are not enrolled in any active semester courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course._id} 
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
            >
              {/* Card Header with Color Strip */}
              <div className="h-2 bg-orange-500 w-full"></div>
              
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {course.courseCode}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{course.credits} Credits</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {course.courseName}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <User size={16} />
                  <span>{course.faculty || "TBD"}</span>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                    <p>Room: <span className="font-medium text-gray-700">{course.room || "N/A"}</span></p>
                    <p>Section: <span className="font-medium text-gray-700">{course.section || "A"}</span></p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/student/resources/${course._id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <BookOpen size={18} />
                  <span>View Resources</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;