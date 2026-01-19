import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Bell, Calendar, User } from "lucide-react";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // This route needs to exist in your backend (see Part 5 below)
        const { data } = await api.get("/announcements/my-notices"); 
        setNotices(data);
      } catch (err) {
        console.error("Failed to load notices", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Notices...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="text-blue-600" /> Institute Notice Board
      </h1>

      {notices.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">No recent announcements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice._id} className="bg-white p-5 rounded-lg shadow-sm border border-l-4 border-l-blue-500 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-800">{notice.title}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(notice.date).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">{notice.content}</p>
              <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <User size={14} /> Posted by Admin
                </span>
                <span className="uppercase text-xs font-bold tracking-wider text-blue-600">
                    {notice.targetAudience}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;