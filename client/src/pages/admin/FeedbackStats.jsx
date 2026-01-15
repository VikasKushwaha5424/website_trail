import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Star } from "lucide-react";

const FeedbackStats = () => {
  const [stats, setStats] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // To toggle comments view

  useEffect(() => {
    api.get("/feedback/stats").then(res => setStats(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Faculty Performance Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item) => (
          <div key={item._id} className="bg-white p-5 rounded-xl shadow border-t-4 border-yellow-400">
            <h3 className="font-bold text-lg">{item.facultyName}</h3>
            <p className="text-sm text-gray-500 mb-2">{item.courseName}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold text-gray-800">{item.avgRating.toFixed(1)}</span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} size={16} fill={i < Math.round(item.avgRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs text-gray-400">({item.count} reviews)</span>
            </div>

            <button 
              onClick={() => setSelectedId(selectedId === item._id ? null : item._id)}
              className="text-blue-600 text-sm hover:underline"
            >
              {selectedId === item._id ? "Hide Comments" : "View Student Comments"}
            </button>

            {selectedId === item._id && (
              <div className="mt-4 bg-gray-50 p-3 rounded text-sm space-y-2 max-h-40 overflow-y-auto">
                {item.comments.length > 0 ? (
                  item.comments.map((c, idx) => (
                    <p key={idx} className="border-b pb-1 italic text-gray-600">"{c}"</p>
                  ))
                ) : (
                  <p className="text-gray-400">No written comments.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackStats;