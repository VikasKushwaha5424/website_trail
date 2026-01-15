const express = require("express");
const router = express.Router();

// 1. Import Middleware
const { protect, authorize } = require("../middleware/authMiddleware");

// 2. Import Controller Functions
const { 
  getStudentProfile, 
  getStudentCourses, 
  getAttendanceStats,
  getStudentMarks,
  getDashboardAnnouncements, // 👈 CHANGED: Matches the new Controller export
  getIDCardDetails 
} = require("../controllers/studentController");

// ==========================================
// 🔒 GLOBAL SECURITY FOR THESE ROUTES
// ==========================================
// 1. User must have a valid Token
router.use(protect); 

// 2. User must be a STUDENT (Faculty/Admins cannot peek at student data here)
router.use(authorize("student")); 

// ==========================================
// 🚦 ROUTES
// ==========================================

// GET /api/student/profile
router.get("/profile", getStudentProfile);

// GET /api/student/courses (Timetable)
router.get("/courses", getStudentCourses);

// GET /api/student/attendance (Stats)
router.get("/attendance", getAttendanceStats);

// GET /api/student/marks (Results)
router.get("/marks", getStudentMarks);

// GET /api/student/announcements 
// 👈 CHANGED: Path is now "/announcements" to match Frontend
router.get("/announcements", getDashboardAnnouncements);

// GET /api/student/id-card (ID Card Generator Data)
router.get("/id-card", getIDCardDetails);

module.exports = router;