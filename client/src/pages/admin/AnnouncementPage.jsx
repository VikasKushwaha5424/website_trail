import { useState } from "react";
import api from "../../utils/api";
import { Megaphone } from "lucide-react";

const AnnouncementPage = () => {
  const [form, setForm] = useState({ title: "", message: "", target: "ALL" });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/admin/broadcast", form);
      alert("Announcement Sent Successfully!");
      setForm({ title: "", message: "", target: "ALL" });
    } catch (err) {
      alert("Failed to send notice");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Megaphone size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Broadcast Notice</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          
          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.target}
              onChange={e => setForm({...form, target: e.target.value})}
            >
              <option value="ALL">Everyone (Global)</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Title</label>
            <input 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Holiday on Monday"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message Body</label>
            <textarea 
              className="w-full p-3 border border-gray-200 rounded-lg h-40 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Type your announcement here..."
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              required
            />
          </div>

          {/* Submit */}
          <button 
            disabled={sending}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {sending ? "Sending..." : "Publish Announcement"}
          </button>

        </form>
      </div>
    </div>
  );
};
export default AnnouncementPage;