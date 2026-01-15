import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Clock, MapPin } from "lucide-react";

const MySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

  useEffect(() => {
    api.get("/timetable/faculty")
      .then((res) => setSchedule(res.data))
      .catch((err) => console.error("Failed to load schedule"))
      .finally(() => setLoading(false));
  }, []);

  const getClassForSlot = (day, time) => {
    return schedule.find(s => s.day === day && s.startTime.startsWith(time));
  };

  if (loading) return <div className="p-10 text-center">Loading Schedule...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-blue-600" /> My Weekly Schedule
      </h2>

      <div className="bg-white p-4 rounded-xl shadow border overflow-x-auto">
        {/* Grid Header */}
        <div className="grid grid-cols-7 border-b pb-2 min-w-[800px]">
          <div className="font-bold text-gray-400 text-center">Time</div>
          {days.map(day => (
            <div key={day} className="font-bold text-gray-700 text-center">{day}</div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="min-w-[800px]">
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-7 border-b last:border-0 min-h-[100px]">
              {/* Time Column */}
              <div className="p-4 text-xs font-bold text-gray-400 border-r flex items-center justify-center">
                {time}
              </div>

              {/* Days Columns */}
              {days.map(day => {
                const session = getClassForSlot(day, time);
                return (
                  <div key={day} className="border-r last:border-0 p-1 relative group">
                    {session ? (
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded h-full text-xs shadow-sm hover:shadow-md transition cursor-pointer">
                        <div className="font-bold text-blue-900 truncate">
                          {session.courseOfferingId?.courseId?.name}
                        </div>
                        <div className="text-blue-700 font-mono mt-1">
                          {session.courseOfferingId?.courseId?.code}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-gray-600">
                          <MapPin size={10} /> {session.roomId?.name || "Room TBD"}
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] px-1 rounded">
                          {session.startTime} - {session.endTime}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full hover:bg-gray-50 transition"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MySchedule;