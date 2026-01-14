import { useState, useEffect } from "react";
import api from "../../utils/api";

const TimetableScheduler = () => {
  const [schedule, setSchedule] = useState([]);
  const [day, setDay] = useState("MONDAY");
  
  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [slotData, setSlotData] = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00", roomNumber: "", courseOfferingId: "" });
  const [freeRooms, setFreeRooms] = useState([]);

  // Fetch Schedule
  const fetchSchedule = async () => {
    try {
      const { data } = await api.get(`/admin/timetable?day=${day}`);
      setSchedule(data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSchedule(); }, [day]);

  // Handle Find Rooms (Step 1)
  const handleFindRooms = async () => {
    // Convert time string to number format expected by backend (09:00 -> 900)
    const start = parseInt(slotData.startTime.replace(":", ""));
    const end = parseInt(slotData.endTime.replace(":", ""));
    
    try {
      const { data } = await api.post("/admin/find-free-rooms", { 
        dayOfWeek: slotData.dayOfWeek, 
        startTime: start, 
        endTime: end 
      });
      setFreeRooms(data.freeRooms);
      setWizardStep(2);
    } catch (err) { alert("Error finding rooms"); }
  };

  // Handle Save Slot (Step 2)
  const handleSaveSlot = async () => {
    try {
      await api.post("/admin/timetable", slotData);
      alert("Slot Scheduled!");
      setWizardStep(1);
      fetchSchedule();
    } catch (err) { alert(err.response?.data?.error); }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this slot?")) return;
    await api.delete(`/admin/timetable/${id}`);
    fetchSchedule();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Timetable Scheduler</h2>
        <select value={day} onChange={e => setDay(e.target.value)} className="border p-2 rounded">
          {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded shadow p-4 mb-8">
        {schedule.length === 0 ? <p className="text-center text-gray-500">No classes scheduled for {day}</p> : (
          <div className="grid gap-2">
            {schedule.map(item => (
              <div key={item._id} className="flex justify-between border p-3 rounded hover:bg-gray-50">
                <div>
                  <span className="font-bold text-blue-600">{item.startTime} - {item.endTime}</span>
                  <span className="ml-4 font-semibold">{item.courseOfferingId?.courseId?.name}</span>
                  <span className="ml-4 text-sm text-gray-600">Room: {item.roomNumber}</span>
                  <span className="ml-4 text-sm text-gray-500">Prof. {item.courseOfferingId?.facultyId?.firstName}</span>
                </div>
                <button onClick={() => handleDelete(item._id)} className="text-red-500 text-sm">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Slot Wizard */}
      <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Add New Slot</h3>
        
        {wizardStep === 1 && (
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs">Day</label>
              <select className="w-full border p-2 rounded" value={slotData.dayOfWeek} onChange={e => setSlotData({...slotData, dayOfWeek: e.target.value})}>
                {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs">Start Time</label>
              <input type="time" className="w-full border p-2 rounded" value={slotData.startTime} onChange={e => setSlotData({...slotData, startTime: e.target.value})} />
            </div>
            <div>
              <label className="text-xs">End Time</label>
              <input type="time" className="w-full border p-2 rounded" value={slotData.endTime} onChange={e => setSlotData({...slotData, endTime: e.target.value})} />
            </div>
            <button onClick={handleFindRooms} className="bg-indigo-600 text-white p-2 rounded">Find Rooms &rarr;</button>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-green-600">✅ Found {freeRooms.length} available rooms.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <select className="border p-2 rounded" onChange={e => setSlotData({...slotData, roomNumber: e.target.value})}>
                <option value="">Select Room</option>
                {freeRooms.map(r => <option key={r._id} value={r.roomNumber}>{r.roomNumber} (Cap: {r.capacity})</option>)}
              </select>
              
              <input 
                placeholder="Course Offering ID" 
                className="border p-2 rounded" 
                onChange={e => setSlotData({...slotData, courseOfferingId: e.target.value})} 
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setWizardStep(1)} className="bg-gray-300 px-4 py-2 rounded">Back</button>
              <button onClick={handleSaveSlot} className="bg-green-600 text-white px-4 py-2 rounded">Save Slot</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TimetableScheduler;