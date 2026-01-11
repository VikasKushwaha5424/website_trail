const FacultyCourse = require("../models/FacultyCourse");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const User = require("../models/User");

// 1. Get Courses Assigned to Logged-in Faculty
exports.getAssignedCourses = async (req, res) => {
  try {
    const facultyId = req.user.id; // Got from the Token

    // Find links where this faculty is the teacher
    const assignments = await FacultyCourse.find({ facultyId }).populate("courseId");
    
    // Extract just the course details to send to frontend
    // Filter out any nulls in case a course was deleted
    const courses = assignments
      .filter(a => a.courseId) 
      .map(a => a.courseId);
    
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching assigned courses" });
  }
};

// 2. Get Students for a specific Course
exports.getStudentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Fetch students in that Dept
    // Populating 'userId' gives us the Name and Roll Number
    const students = await Student.find({ departmentId: course.departmentId })
      .populate("userId", "name rollNumber");

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching students" });
  }
};

// 3. Mark Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, date, students } = req.body; 
    // students array looks like: [{ studentId: "...", status: "Present" }]

    for (const record of students) {
      await Attendance.findOneAndUpdate(
        { studentId: record.studentId, courseId, date }, // Search criteria
        { status: record.status }, // Update
        { upsert: true, new: true } // Create if it doesn't exist
      );
    }

    res.json({ message: "Attendance Marked Successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving attendance" });
  }
};