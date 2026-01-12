const { Hostel, Room } = require("../models/Hostel");

// 1. Allocate Room to Student
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId, roomNumber, hostelName } = req.body;

    const hostel = await Hostel.findOne({ name: hostelName });
    if (!hostel) return res.status(404).json({ error: "Hostel not found" });

    const room = await Room.findOne({ hostelId: hostel._id, roomNumber });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // ✅ FIX 1: Check if student is already in THIS room
    if (room.occupants.includes(studentId)) {
        return res.status(400).json({ error: "Student already in this room" });
    }

    // ✅ FIX 2: Check Capacity
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ error: "Room is Full!" });
    }

    // ✅ FIX 3: (Advanced) Check if student is in ANY room (Optional but recommended)
    // const existingRoom = await Room.findOne({ occupants: studentId });
    // if (existingRoom) return res.status(400).json({ error: "Student already has a room!" });

    // C. Assign (Using push is safe now due to check above, but $addToSet is safer in concurrency)
    room.occupants.push(studentId);
    await room.save();

    res.json({ message: "Room Allocated Successfully", room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};