const Timetable = require("../models/Timetable");
const Enrollment = require("../models/Enrollment");

// 1. Get My Weekly Schedule
exports.getMyTimetable = async (req, res) => {
  try {
    const { studentId } = req.params;

    // A. Find all classes the student is enrolled in
    const enrollments = await Enrollment.find({ studentId });
    const courseOfferingIds = enrollments.map(e => e.courseOfferingId);

    // B. Find timetable slots for those classes
    const schedule = await Timetable.find({ 
      courseOfferingId: { $in: courseOfferingIds } 
    })
    .populate({
      path: "courseOfferingId",
      populate: { path: "courseId", select: "name code" } // Nested populate to get "Python"
    })
    .sort({ dayOfWeek: 1, startTime: 1 }); // Sort by Mon->Fri, 9am->5pm

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Add a Class Slot (Admin/Faculty)
exports.addSlot = async (req, res) => {
  try {
    const newSlot = await Timetable.create(req.body);
    res.status(201).json(newSlot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};