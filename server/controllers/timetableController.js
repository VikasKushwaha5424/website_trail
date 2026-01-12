const Timetable = require("../models/Timetable");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile"); 
const CourseOffering = require("../models/CourseOffering");
const Semester = require("../models/Semester"); // ✅ Added Import

// =========================================================
// 1. Get My Weekly Schedule (Active Semester Only)
// =========================================================
exports.getMyTimetable = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    // ✅ FIX: Get Active Semester
    const activeSemester = await Semester.findOne({ isActive: true });
    
    // If no semester is active (e.g., Summer Break), return empty schedule
    if (!activeSemester) {
        return res.json([]); 
    }

    // ✅ FIX: Find enrollments ONLY for the active semester
    // 1. Find all Course Offerings available in the current semester
    const currentOfferings = await CourseOffering.find({ semesterId: activeSemester._id }).select("_id");
    const currentOfferingIds = currentOfferings.map(o => o._id);

    // 2. Find student's enrollments that match these offerings
    const enrollments = await Enrollment.find({ 
        studentId: student._id,
        courseOfferingId: { $in: currentOfferingIds } 
    });

    const myOfferingIds = enrollments.map(e => e.courseOfferingId);

    // 3. Fetch timetable slots for these specific offerings
    const schedule = await Timetable.find({ 
      courseOfferingId: { $in: myOfferingIds } 
    })
    .populate({
      path: "courseOfferingId",
      populate: { path: "courseId", select: "name code" }
    })
    .sort({ dayOfWeek: 1, startTime: 1 }); 

    res.json(schedule);
  } catch (err) {
    console.error("Timetable Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 2. Add a Class Slot (With Room & Faculty Conflict Checks)
// =========================================================
exports.addSlot = async (req, res) => {
  try {
    const { courseOfferingId, dayOfWeek, startTime, endTime, roomNumber } = req.body;

    // 1. Get the Faculty ID for this class
    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) return res.status(404).json({ error: "Course Offering not found" });

    const facultyId = offering.facultyId;

    // 2. CHECK 1: Room Conflict (Is the Room busy?)
    // Check if any slot uses this room on this day, where times overlap
    const roomConflict = await Timetable.findOne({
        roomNumber,
        dayOfWeek,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // Overlap logic
        ]
    });
    
    if (roomConflict) {
        return res.status(400).json({ error: `Room ${roomNumber} is already booked on ${dayOfWeek} during this time.` });
    }

    // 3. ✅ CHECK 2: Faculty Conflict (Is the Teacher busy?)
    // Find ALL classes taught by this faculty to check their schedule
    const facultyOfferings = await CourseOffering.find({ facultyId }).select("_id");
    const facultyOfferingIds = facultyOfferings.map(o => o._id);

    const facultyConflict = await Timetable.findOne({
        courseOfferingId: { $in: facultyOfferingIds }, // Look at any class this teacher has
        dayOfWeek,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    });

    if (facultyConflict) {
        return res.status(400).json({ error: "This Faculty is already teaching another class at this time!" });
    }

    // 4. Create Slot (No conflicts found)
    const newSlot = await Timetable.create(req.body);
    res.status(201).json(newSlot);

  } catch (err) {
    console.error("Add Slot Error:", err);
    res.status(500).json({ error: err.message });
  }
};