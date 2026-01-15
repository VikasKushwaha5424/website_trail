import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Star, MessageSquare, TrendingUp } from "lucide-react";

const MyPerformance = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/feedback/my-performance")
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to load feedback"))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
      />
    ));
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading insights...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <TrendingUp className="text-blue-600" /> My Performance Insights
      </h2>

      {stats.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow border text-center">
          <p className="text-gray-500 text-lg">No feedback received yet.</p>
          <p className="text-sm text-gray-400 mt-2">Feedback usually appears after mid-terms or finals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {stats.map((course, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Header: Score & Details */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{course.courseName}</h3>
                  <p className="text-sm text-gray-500 font-mono">{course.courseCode}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-700">{course.averageRating}<span className="text-lg text-gray-400">/5</span></div>
                  <div className="flex gap-1 mt-1">{renderStars(course.averageRating)}</div>
                  <p className="text-xs text-gray-500 mt-1">{course.totalReviews} Student Reviews</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="p-6 bg-gray-50/50">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MessageSquare size={16} /> Anonymous Comments
                </h4>
                
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {course.comments.length > 0 ? (
                    course.comments.map((comment, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 text-gray-600 text-sm italic shadow-sm">
                        "{comment}"
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">No written comments provided.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPerformance;