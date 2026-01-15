import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Star, MessageSquare, Loader } from "lucide-react";

const StudentFeedback = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ courseOfferingId: "", rating: 5, comment: "" });

  useEffect(() => {
    // Fetches the list of courses for the active semester
    // Matches the updated route in studentRoutes.js -> router.get("/courses", ...)
    api.get("/student/courses")
      .then(res => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch courses:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseOfferingId) {
      alert("Please select a course first.");
      return;
    }

    try {
      await api.post("/feedback", form);
      alert("Feedback Sent! Thank you.");
      // Reset form but keep the rating at 5
      setForm({ courseOfferingId: "", rating: 5, comment: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Submission Failed");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 flex justify-center items-center gap-2">
        <Loader className="animate-spin" /> Loading courses...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-700">
          <MessageSquare /> Course Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Select Course */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Select Course</label>
            <select 
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none"
              value={form.courseOfferingId}
              onChange={e => setForm({...form, courseOfferingId: e.target.value})}
              required
            >
              <option value="">-- Choose a Class --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.faculty})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Star Rating */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({...form, rating: star})}
                  className={`p-1 transition-transform hover:scale-110 ${
                    form.rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  <Star fill="currentColor" size={36} />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Comments */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Comments (Anonymous)</label>
            <textarea 
              className="w-full p-3 border rounded-lg bg-gray-50 h-24 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="What did you like? What can be improved?"
              value={form.comment}
              onChange={e => setForm({...form, comment: e.target.value})}
            />
          </div>

          {/* Submit Button */}
          <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition shadow-md">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentFeedback;