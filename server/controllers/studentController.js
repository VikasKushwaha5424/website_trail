const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");
const Enrollment = require("../models/Enrollment");

// 1. GET MY PROFILE
exports.getProfile = async (req, res) => {
  try {
    // Find the Student document linked to the currently logged-in User
    const student = await Student.findOne({ userId: req.user._id })
      .populate("userId", "name email role") // Get name/email from User model
      .populate("departmentId", "departmentName"); // Get department name

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 2. GET MY COURSES
exports.getMyCourses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Find all enrollments for this student
    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate("courseId", "subjectName subjectCode credits");

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 3. GET MY ATTENDANCE
exports.getAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Fetch all attendance records for this student
    const attendance = await Attendance.find({ studentId: student._id })
      .populate("courseId", "subjectName subjectCode")
      .sort({ date: -1 }); // Sort by newest first

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 4. GET MY MARKS
exports.getMarks = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const marks = await Marks.find({ studentId: student._id })
      .populate("courseId", "subjectName subjectCode");

    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};