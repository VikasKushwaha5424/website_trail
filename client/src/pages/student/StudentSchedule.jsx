import { useState, useEffect } from "react";
import api from "../../utils/api";

const StudentSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: Convert Minutes (e.g., 540) to Time (e.g., "9:00 AM")
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Matches route: router.get("/my-schedule", ...) in timetableRoutes.js
        const { data } = await api.get("/timetable/my-schedule");
        setSchedule(data);
      } catch (error) {
        console.error("Failed to fetch schedule", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // Group data by Day for easier rendering
  const daysOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const groupedSchedule = daysOrder.reduce((acc, day) => {
    acc[day] = schedule.filter((s) => s.dayOfWeek === day);
    return acc;
  }, {});

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Timetable...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">My Weekly Timetable</h1>
        <p className="text-gray-500">View your classes for the active semester.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {daysOrder.map((day) => (
          <div key={day} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">{day}</h2>
            
            {groupedSchedule[day].length === 0 ? (
              <p className="text-gray-400 italic text-sm">No classes scheduled.</p>
            ) : (
              <div className="space-y-3">
                {groupedSchedule[day].map((slot) => (
                  <div key={slot._id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 hover:shadow-md transition-shadow">
                    <div className="flex justify-between font-bold text-gray-700">
                      <span>{slot.courseOfferingId?.courseId?.code}</span>
                      <span className="text-sm text-blue-600 whitespace-nowrap ml-2">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 font-medium">
                      {slot.courseOfferingId?.courseId?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span>📍 Room: {slot.roomNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSchedule;