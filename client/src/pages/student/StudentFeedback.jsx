import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Star, MessageSquare } from "lucide-react";

const StudentFeedback = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ courseOfferingId: "", rating: 5, comment: "" });

  useEffect(() => {
    // Reuse existing endpoint to get student's classes
    api.get("/student/my-courses").then(res => setEnrollments(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/feedback", form);
      alert("Feedback Sent! Thank you.");
      setForm({ courseOfferingId: "", rating: 5, comment: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Submission Failed");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-700">
          <MessageSquare /> Course Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Select Course</label>
            <select 
              className="w-full p-2 border rounded"
              value={form.courseOfferingId}
              onChange={e => setForm({...form, courseOfferingId: e.target.value})}
              required
            >
              <option value="">-- Choose a Class --</option>
              {enrollments.map(enrol => (
                <option key={enrol.courseOfferingId._id} value={enrol.courseOfferingId._id}>
                  {enrol.courseOfferingId.courseId.name} (Prof. {enrol.courseOfferingId.facultyId.lastName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Rating (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({...form, rating: star})}
                  className={`p-2 rounded-full transition ${form.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                >
                  <Star fill="currentColor" size={32} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Comments (Anonymous)</label>
            <textarea 
              className="w-full p-2 border rounded h-24"
              placeholder="What did you like? What can be improved?"
              value={form.comment}
              onChange={e => setForm({...form, comment: e.target.value})}
            />
          </div>

          <button className="w-full bg-purple-600 text-white font-bold py-3 rounded hover:bg-purple-700">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentFeedback;