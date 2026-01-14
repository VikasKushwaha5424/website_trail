import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Trash, MapPin, Plus } from "lucide-react";

const ClassroomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ roomNumber: "", capacity: 60, type: "LECTURE_HALL" });

  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/admin/classrooms");
      setRooms(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/add-classroom", form);
      setForm({ roomNumber: "", capacity: 60, type: "LECTURE_HALL" });
      fetchRooms();
    } catch (err) { alert("Failed to add room"); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this room?")) return;
    try {
      await api.delete(`/admin/delete-classroom/${id}`);
      fetchRooms();
    } catch (err) { alert("Failed to delete"); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MapPin className="text-blue-600"/> Classroom Manager
      </h2>

      {/* Add Room Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="font-bold text-gray-700 mb-4">Add Physical Room</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Room No.</label>
            <input className="border p-2 rounded w-32" value={form.roomNumber} onChange={e=>setForm({...form, roomNumber: e.target.value})} placeholder="e.g. 101" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Capacity</label>
            <input type="number" className="border p-2 rounded w-24" value={form.capacity} onChange={e=>setForm({...form, capacity: e.target.value})} required />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase">Type</label>
            <select className="border p-2 rounded w-full" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Laboratory</option>
              <option value="SEMINAR_HALL">Seminar Hall</option>
            </select>
          </div>
          <button className="bg-blue-600 text-white p-2 rounded flex items-center gap-2 hover:bg-blue-700 font-bold">
            <Plus size={18}/> Add
          </button>
        </form>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map(room => (
          <div key={room._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500 relative group">
            <h4 className="text-xl font-bold text-gray-800">{room.roomNumber}</h4>
            <p className="text-sm text-gray-500">{room.type.replace("_", " ")}</p>
            <div className="mt-2 text-xs font-bold bg-gray-100 inline-block px-2 py-1 rounded text-gray-600">
              Cap: {room.capacity}
            </div>
            <button 
              onClick={() => handleDelete(room._id)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash size={16}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomManagement;