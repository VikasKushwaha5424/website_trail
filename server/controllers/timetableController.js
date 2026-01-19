const Timetable = require("../models/Timetable");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile"); 
const CourseOffering = require("../models/CourseOffering");
const Semester = require("../models/Semester"); 
const FacultyProfile = require("../models/FacultyProfile");

// =========================================================
// 🕒 HELPER: Convert "HH:mm" String to Minutes (Integer)
// =========================================================
const convertToMinutes = (timeStr) => {
  if (typeof timeStr === 'number') return timeStr;
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(":")) {
    throw new Error(`Invalid time format '${timeStr}'. Expected HH:mm`);
  }
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// =========================================================
// 1. Get My Weekly Schedule (Active Semester Only) - STUDENT
// =========================================================
exports.getMyTimetable = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    // Get Active Semester
    const activeSemester = await Semester.findOne({ isActive: true });
    
    // If no semester is active, return empty schedule
    if (!activeSemester) {
        return res.json([]); 
    }

    // Find enrollments ONLY for the active semester
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
// 2. Add a Class Slot (With Room & Faculty Conflict Checks) - ADMIN
// =========================================================
exports.addSlot = async (req, res) => {
  try {
    const { courseOfferingId, dayOfWeek, startTime, endTime, roomNumber } = req.body;

    // 👇 CONVERT TIMES BEFORE DOING ANYTHING
    const startMin = convertToMinutes(startTime);
    const endMin = convertToMinutes(endTime);

    if (startMin >= endMin) {
        return res.status(400).json({ error: "Start Time must be before End Time" });
    }

    // 1. Get the Faculty ID
    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) return res.status(404).json({ error: "Course Offering not found" });

    const facultyId = offering.facultyId;

    // 2. CHECK 1: Room Conflict (Is the Room busy?)
    // Check if any slot uses this room on this day, where times overlap
    const roomConflict = await Timetable.findOne({
        roomNumber,
        dayOfWeek,
        $or: [
            // Use the converted MINUTES for comparison
            { startTime: { $lt: endMin }, endTime: { $gt: startMin } } 
        ]
    });
    
    if (roomConflict) {
        return res.status(400).json({ error: `Room ${roomNumber} is already booked on ${dayOfWeek} during this time.` });
    }

    // 3. CHECK 2: Faculty Conflict (Is the Teacher busy?)
    // Find ALL classes taught by this faculty to check their schedule
    const facultyOfferings = await CourseOffering.find({ facultyId }).select("_id");
    const facultyOfferingIds = facultyOfferings.map(o => o._id);

    const facultyConflict = await Timetable.findOne({
        courseOfferingId: { $in: facultyOfferingIds }, // Look at any class this teacher has
        dayOfWeek,
        $or: [
            { startTime: { $lt: endMin }, endTime: { $gt: startMin } }
        ]
    });

    if (facultyConflict) {
        return res.status(400).json({ error: "This Faculty is already teaching another class at this time!" });
    }

    // 4. Create Slot (Save as Numbers)
    const newSlot = await Timetable.create({
        courseOfferingId,
        dayOfWeek,
        startTime: startMin, // Save 540
        endTime: endMin,     // Save 600
        roomNumber
    });

    res.status(201).json(newSlot);

  } catch (err) {
    console.error("Add Slot Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 3. Get My DAILY Schedule (For Dashboard Home Widget) - SHARED
// =========================================================
exports.getMyDailySchedule = async (req, res) => {
  try {
    // 1. Determine "Today" (e.g., "MONDAY")
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const today = days[new Date().getDay()];

    let courseOfferingIds = [];

    // 2. Identify User Role & Get Related Courses
    if (req.user.role === "student") {
        const student = await StudentProfile.findOne({ userId: req.user.id });
        if (!student) return res.status(404).json({ message: "Profile not found" });

        // Get Active Semester
        const activeSemester = await Semester.findOne({ isActive: true });
        if (!activeSemester) return res.json({ day: today, schedule: [] }); 

        // Find active enrollments
        const enrollments = await Enrollment.find({ 
            studentId: student._id,
            status: "ENROLLED"
        }).populate("courseOfferingId");

        // Filter enrollments by active semester
        courseOfferingIds = enrollments
            .filter(e => e.courseOfferingId.semesterId.toString() === activeSemester._id.toString())
            .map(e => e.courseOfferingId._id);

    } else if (req.user.role === "faculty") {
        const faculty = await FacultyProfile.findOne({ userId: req.user.id });
        if (!faculty) return res.status(404).json({ message: "Profile not found" });

        const offerings = await CourseOffering.find({ facultyId: faculty._id });
        courseOfferingIds = offerings.map(o => o._id);
    }

    // 3. Fetch Timetable for TODAY only
    const dailySchedule = await Timetable.find({
        courseOfferingId: { $in: courseOfferingIds },
        dayOfWeek: today
    })
    .populate({
        path: "courseOfferingId",
        populate: { path: "courseId", select: "name code" }
    })
    .sort({ startTime: 1 });

    res.json({ day: today, schedule: dailySchedule });

  } catch (err) {
    console.error("Daily Schedule Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 4. Get Specific Faculty's Weekly Schedule - FACULTY
// =========================================================
exports.getFacultyTimetable = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Find Faculty Profile
    const faculty = await FacultyProfile.findOne({ userId });
    if (!faculty) return res.status(404).json({ error: "Faculty profile not found" });

    // 2. Find all Courses taught by this Faculty
    const myCourses = await CourseOffering.find({ facultyId: faculty._id }).select("_id");
    const courseIds = myCourses.map(c => c._id);

    // 3. Find Timetable entries for these courses
    const schedule = await Timetable.find({ courseOfferingId: { $in: courseIds } })
      .populate({
        path: "courseOfferingId",
        populate: { path: "courseId", select: "name code" }
      })
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json(schedule);
  } catch (err) {
    console.error("Faculty Timetable Error:", err);
    res.status(500).json({ error: err.message });
  }
};