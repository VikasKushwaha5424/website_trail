const Timetable = require("../models/Timetable");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile"); // ✅ Added Import

// 1. Get My Weekly Schedule (SECURE)
exports.getMyTimetable = async (req, res) => {
  try {
    // ✅ FIX: Get Student ID from the verified Token, not the URL
    // req.user.id comes from the 'protect' middleware
    const student = await StudentProfile.findOne({ userId: req.user.id });
    
    if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
    }

    // A. Find all classes the student is enrolled in
    const enrollments = await Enrollment.find({ studentId: student._id });
    const courseOfferingIds = enrollments.map(e => e.courseOfferingId);

    // B. Find timetable slots for those classes
    const schedule = await Timetable.find({ 
      courseOfferingId: { $in: courseOfferingIds } 
    })
    .populate({
      path: "courseOfferingId",
      populate: { path: "courseId", select: "name code" } // Nested populate to get Course Name
    })
    .sort({ dayOfWeek: 1, startTime: 1 }); // Sort by Mon->Fri, 9am->5pm

    res.json(schedule);
  } catch (err) {
    console.error("Timetable Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Add a Class Slot (Admin/Faculty)
exports.addSlot = async (req, res) => {
  try {
    // Note: Security for this (Admin/Faculty only) is handled in the Route file
    const newSlot = await Timetable.create(req.body);
    res.status(201).json(newSlot);
  } catch (err) {
    console.error("Add Slot Error:", err);
    res.status(500).json({ error: err.message });
  }
};