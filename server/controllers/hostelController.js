const { Hostel, Room } = require("../models/Hostel");

// =========================================================
// 1. Allocate Room to Student (Concurrency Safe)
// =========================================================
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId, roomNumber, hostelName } = req.body;

    const hostel = await Hostel.findOne({ name: hostelName });
    if (!hostel) return res.status(404).json({ error: "Hostel not found" });

    // 1. Initial Lookup: Check if room exists
    const room = await Room.findOne({ hostelId: hostel._id, roomNumber });

    if (!room) return res.status(404).json({ error: "Room not found" });

    // 2. Check duplication (Basic JavaScript check for fast feedback)
    // Note: The database query below acts as the final "source of truth" safeguard
    if (room.occupants.includes(studentId)) {
        return res.status(400).json({ error: "Student already in this room" });
    }

    // 🔒 3. ATOMIC UPDATE: Check Capacity AND Add unique in one operation
    // This prevents "Race Conditions" and ensures no duplicates
    const updatedRoom = await Room.findOneAndUpdate(
      { 
        _id: room._id, 
        // Condition: Array size must be STRICTLY less than Capacity
        $expr: { $lt: [{ $size: "$occupants" }, "$capacity"] } 
      },
      { 
        // 👇 FIX: Using $addToSet instead of $push prevents duplicates at the database level
        $addToSet: { occupants: studentId } 
      },
      { new: true } // Return the updated document
    );

    // If updatedRoom is null, it means the condition ($lt capacity) failed
    if (!updatedRoom) {
       return res.status(400).json({ error: "Room is Full! (Allocation Failed)" });
    }

    res.json({ message: "Room Allocated Successfully", room: updatedRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};