const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");
const CourseOffering = require("../models/CourseOffering");
const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");

// 👇 CRITICAL IMPORTS: Required for .populate() to work correctly
const Department = require("../models/Department"); 
const Course = require("../models/Course");
const FacultyProfile = require("../models/FacultyProfile");
const User = require("../models/User"); 

// =========================================================
// 1. GET STUDENT PROFILE (Name, Roll No, Dept)
// =========================================================
exports.getStudentProfile = async (req, res) => {
  try {
    // req.user.id comes from the Auth Middleware
    const profile = await StudentProfile.findOne({ userId: req.user.id })
      .populate("departmentId", "name code") // Needs Department model
      // 👇 FIXED: User model uses 'name', NOT 'username'
      .populate("userId", "email name rollNumber"); 

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =========================================================
// 2. GET TIMETABLE (My Courses & Faculty)
// =========================================================
exports.getStudentCourses = async (req, res) => {
  try {
    // 1. Get Student ID
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Find Enrollments -> Populate Offering -> Populate Course & Faculty
    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate({
        path: "courseOfferingId",
        populate: [
          { path: "courseId", select: "name code credits" }, // Needs Course model
          { path: "facultyId", select: "firstName lastName" } // Needs FacultyProfile model
        ]
      });

    // 3. Format Data for Frontend (Clean Array)
    const timetable = enrollments.map(enroll => {
      const offering = enroll.courseOfferingId;
      // Safety check: ensure offering and courseId exist
      if (!offering || !offering.courseId) return null;

      return {
        courseName: offering.courseId.name,
        courseCode: offering.courseId.code,
        credits: offering.courseId.credits,
        faculty: offering.facultyId 
          ? `${offering.facultyId.firstName} ${offering.facultyId.lastName}` 
          : "TBD",
        room: offering.roomNumber,
        section: offering.section,
        status: enroll.status
      };
    }).filter(item => item !== null); // Remove any nulls

    res.json(timetable);
  } catch (error) {
    console.error("Courses Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =========================================================
// 3. GET ATTENDANCE SUMMARY (Calculated %)
// =========================================================
exports.getAttendanceStats = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 1. Get Total Classes & Present Count
    const totalClasses = await Attendance.countDocuments({ studentId: student._id });
    const presentClasses = await Attendance.countDocuments({ 
      studentId: student._id, 
      status: { $in: ["PRESENT", "LATE"] } 
    });

    // 2. Calculate Percentage
    const percentage = totalClasses === 0 ? 0 : (presentClasses / totalClasses) * 100;

    res.json({
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      attendancePercentage: percentage.toFixed(2)
    });
  } catch (error) {
    console.error("Attendance Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// =========================================================
// 4. GET MY MARKS (Exam Results)
// =========================================================
exports.getStudentMarks = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const marks = await Marks.find({ studentId: student._id })
      .populate({
        path: "courseOfferingId",
        populate: { path: "courseId", select: "name code" } // Needs Course model
      });

    // Format for Frontend
    const result = marks.map(m => {
        // Safety check
        if(!m.courseOfferingId || !m.courseOfferingId.courseId) return null;

        return {
          exam: m.examType, 
          subject: m.courseOfferingId.courseId.name,
          obtained: m.marksObtained,
          max: m.maxMarks,
          percentage: ((m.marksObtained / m.maxMarks) * 100).toFixed(1)
        }
    }).filter(item => item !== null);

    res.json(result);
  } catch (error) {
    console.error("Marks Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};