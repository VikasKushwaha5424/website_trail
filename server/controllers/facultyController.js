const CourseOffering = require("../models/CourseOffering");
const StudentProfile = require("../models/StudentProfile"); 
const FacultyProfile = require("../models/FacultyProfile"); 
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");

// =========================================================
// 1. Get Courses Assigned to Logged-in Faculty
// =========================================================
exports.getAssignedCourses = async (req, res) => {
  try {
    const userId = req.user.id; // From Token

    // STEP 1: Find the Faculty Profile linked to this User
    const facultyProfile = await FacultyProfile.findOne({ userId });
    
    if (!facultyProfile) {
        return res.status(404).json({ message: "Faculty profile not found for this user." });
    }

    // STEP 2: Find CourseOfferings using the FacultyProfile ID
    const assignments = await CourseOffering.find({ facultyId: facultyProfile._id })
      .populate("courseId");
    
    // Extract course details, filtering out any broken links (null courseIds)
    const courses = assignments
      .filter(a => a.courseId) 
      .map(a => a.courseId);
    
    res.json(courses);
  } catch (err) {
    console.error("Error in getAssignedCourses:", err);
    res.status(500).json({ message: "Server error fetching assigned courses" });
  }
};

// =========================================================
// 2. Get Students for a specific Course
// =========================================================
exports.getStudentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Find students in the same department as the course
    // We populate 'userId' to get the actual name and roll number from the User table
    const students = await StudentProfile.find({ departmentId: course.departmentId })
      .populate("userId", "name rollNumber email"); 

    res.json(students);
  } catch (err) {
    console.error("Error in getStudentsForCourse:", err);
    res.status(500).json({ message: "Server error fetching students" });
  }
};

// =========================================================
// 3. Mark Attendance
// =========================================================
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, date, students } = req.body; 
    
    // Use Promise.all for faster parallel processing instead of a standard loop
    await Promise.all(students.map(async (record) => {
      return Attendance.findOneAndUpdate(
        { studentId: record.studentId, courseId, date }, 
        { status: record.status }, 
        { upsert: true, new: true } 
      );
    }));

    res.json({ message: "Attendance Marked Successfully!" });
  } catch (err) {
    console.error("Error in markAttendance:", err);
    res.status(500).json({ message: "Error saving attendance" });
  }
};