import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Calendar, Clock, Trash } from "lucide-react";

const ExamScheduler = () => {
  const [exams, setExams] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default Today
  
  // Form State
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "12:00",
    roomNumber: "",
    courseOfferingId: ""
  });

  const fetchExams = async () => {
    try {
      const { data } = await api.get(`/admin/exams?date=${date}`);
      setExams(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchExams(); }, [date]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/exams", form);
      alert("Exam Scheduled!");
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.error || "Scheduling Failed");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Cancel this exam?")) return;
    try {
      await api.delete(`/admin/exams/${id}`);
      fetchExams();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="text-red-600"/> Exam Scheduler
        </h2>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <label className="font-bold text-gray-600">View Date:</label>
          <input 
            type="date" 
            className="border p-2 rounded"
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: Schedule Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500 h-fit">
          <h3 className="font-bold text-lg mb-4">Schedule New Exam</h3>
          <form onSubmit={handleSchedule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500">Exam Date</label>
              <input type="date" className="w-full border p-2 rounded" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} required />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-500">Start</label>
                <input type="time" className="w-full border p-2 rounded" value={form.startTime} onChange={e=>setForm({...form, startTime: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500">End</label>
                <input type="time" className="w-full border p-2 rounded" value={form.endTime} onChange={e=>setForm({...form, endTime: e.target.value})} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500">Room No.</label>
              <input className="w-full border p-2 rounded" placeholder="e.g. 101" value={form.roomNumber} onChange={e=>setForm({...form, roomNumber: e.target.value})} required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500">Course Offering ID</label>
              <input className="w-full border p-2 rounded" placeholder="Paste ID here" value={form.courseOfferingId} onChange={e=>setForm({...form, courseOfferingId: e.target.value})} required />
            </div>

            <button className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700">
              Confirm Schedule
            </button>
          </form>
        </div>

        {/* RIGHT: Exam List */}
        <div className="md:col-span-2 space-y-4">
          {exams.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded">No exams scheduled for this date.</div>
          ) : (
            exams.map(exam => (
              <div key={exam._id} className="bg-white p-4 rounded shadow border-l-4 border-gray-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg">{exam.courseOfferingId?.courseId?.name} <span className="text-sm text-gray-500">({exam.courseOfferingId?.courseId?.code})</span></h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1"><Clock size={14}/> {exam.startTime} - {exam.endTime}</span>
                    <span className="font-semibold bg-gray-100 px-2 rounded">Room: {exam.roomNumber}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Proctor: {exam.courseOfferingId?.facultyId?.firstName}</p>
                </div>
                <button onClick={() => handleDelete(exam._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                  <Trash size={18} />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ExamScheduler;