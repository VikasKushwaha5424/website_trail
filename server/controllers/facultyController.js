const FacultyProfile = require("../models/FacultyProfile");
const FacultyCourse = require("../models/FacultyCourse");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// 1. GET MY PROFILE
exports.getProfile = async (req, res) => {
  try {
    // req.user.id comes from the 'protect' middleware
    const profile = await FacultyProfile.findOne({ userId: req.user._id }).populate("userId", "name email role");
    
    if (!profile) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 2. GET MY COURSES (Classes I teach)
exports.getCourses = async (req, res) => {
  try {
    // First, find the faculty profile ID using the User ID
    const profile = await FacultyProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Find all courses linked to this Faculty ID
    const courses = await FacultyCourse.find({ facultyId: profile._id })
      .populate("courseId", "subjectName subjectCode semester");

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 3. MARK ATTENDANCE
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, date, students } = req.body; // students = [{ studentId, status }]
    const facultyUser = await FacultyProfile.findOne({ userId: req.user._id });

    // Loop through the list of students sent from frontend
    // Note: In production, use bulkWrite for better performance
    for (const record of students) {
      await Attendance.create({
        studentId: record.studentId,
        courseId: courseId,
        date: new Date(date),
        status: record.status, // "Present" or "Absent"
        markedBy: facultyUser._id
      });
    }

    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error marking attendance", error: err.message });
  }
};