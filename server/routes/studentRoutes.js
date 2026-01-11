const express = require("express");
const router = express.Router();

// 1. Import Middleware
const { protect, authorize } = require("../middleware/authMiddleware");

// 2. Import Controller Functions
const { 
  getStudentProfile, 
  getStudentCourses, 
  getAttendanceStats,
  getStudentMarks
} = require("../controllers/studentController");

// ==========================================
// 🔒 GLOBAL SECURITY
// ==========================================
router.use(protect); 

// FIXED: Allow both "student" and "STUDENT"
router.use(authorize("student", "STUDENT")); 

// ==========================================
// 🚦 ROUTES
// ==========================================
router.get("/profile", getStudentProfile);
router.get("/courses", getStudentCourses);
router.get("/attendance", getAttendanceStats);
router.get("/marks", getStudentMarks);

module.exports = router;