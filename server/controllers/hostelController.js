const { Hostel, Room } = require("../models/Hostel");
const StudentProfile = require("../models/StudentProfile"); 

// =========================================================
// 1. Allocate Room to Student (FIXED DUPLICATE CHECK)
// =========================================================
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId, roomNumber, hostelName } = req.body;

    // 👇 CHECK 0: Is student already in ANY room?
    // This prevents one student from occupying two beds in different rooms
    const existingProfile = await StudentProfile.findById(studentId);
    if (!existingProfile) {
        return res.status(404).json({ error: "Student Profile not found" });
    }

    if (existingProfile.residencyType === "HOSTELLER") {
        return res.status(400).json({ 
            error: `Student is already allocated to ${existingProfile.hostelDetails?.hostelName} Room ${existingProfile.hostelDetails?.roomNumber}` 
        });
    }

    const hostel = await Hostel.findOne({ name: hostelName });
    if (!hostel) return res.status(404).json({ error: "Hostel not found" });

    // 1. Initial Lookup: Check if room exists
    const room = await Room.findOne({ hostelId: hostel._id, roomNumber });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // 2. Check simple duplication in the target room
    if (room.occupants.includes(studentId)) {
        return res.status(400).json({ error: "Student is already in this room" });
    }

    // 🔒 3. ATOMIC UPDATE: Check Capacity AND Add unique in one operation
    const updatedRoom = await Room.findOneAndUpdate(
      { 
        _id: room._id, 
        $expr: { $lt: [{ $size: "$occupants" }, "$capacity"] } 
      },
      { $addToSet: { occupants: studentId } },
      { new: true }
    );

    // If updatedRoom is null, it means the condition ($lt capacity) failed
    if (!updatedRoom) {
       return res.status(400).json({ error: "Room is Full! (Allocation Failed)" });
    }

    // ✅ 4. SYNC UPDATE: Update Student Profile with Residency Details
    await StudentProfile.findByIdAndUpdate(studentId, {
      residencyType: "HOSTELLER",
      hostelDetails: {
        hostelName: hostelName,
        roomNumber: roomNumber
      }
    });

    res.json({ message: "Room Allocated Successfully", room: updatedRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 2. Add Hostel Building
// =========================================================
exports.addHostel = async (req, res) => {
  try {
    const { name, type, totalFloors } = req.body;
    const hostel = await Hostel.create({ name, type, totalFloors });
    res.status(201).json(hostel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 3. Add Room to Hostel
// =========================================================
exports.addRoom = async (req, res) => {
  try {
    const { hostelId, roomNumber, floor, capacity, type, feesPerSemester } = req.body;
    const room = await Room.create({ 
        hostelId, roomNumber, floor, capacity, type, feesPerSemester 
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 4. Get Hostel Details (With Rooms)
// =========================================================
exports.getHostelDetails = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    // For each hostel, find its rooms
    const result = await Promise.all(hostels.map(async (h) => {
        const rooms = await Room.find({ hostelId: h._id }).populate("occupants", "firstName lastName rollNumber");
        return { ...h._doc, rooms };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 5. Vacate Room (Cleanup)
// =========================================================
exports.vacateRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    // 1. Remove from Room
    await Room.findByIdAndUpdate(roomId, {
        $pull: { occupants: studentId }
    });

    // 2. Reset Student Profile
    await StudentProfile.findByIdAndUpdate(studentId, {
        residencyType: "DAY_SCHOLAR",
        hostelDetails: null
    });

    res.json({ message: "Room Vacated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};