const { Hostel, Room } = require("../models/Hostel");

// 1. Allocate Room to Student
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId, roomNumber, hostelName } = req.body;

    // A. Find Hostel & Room
    const hostel = await Hostel.findOne({ name: hostelName });
    if (!hostel) return res.status(404).json({ error: "Hostel not found" });

    const room = await Room.findOne({ hostelId: hostel._id, roomNumber });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // B. Check Capacity
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ error: "Room is Full!" });
    }

    // C. Assign
    room.occupants.push(studentId);
    await room.save();

    res.json({ message: "Room Allocated Successfully", room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};