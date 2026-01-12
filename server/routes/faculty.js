const express = require("express");
const router = express.Router();

// 1. Import Middleware
// 'protect' checks for a token, 'facultyOnly' checks for role
const { protect, facultyOnly } = require("../middleware/authMiddleware"); 

// 2. Import Controller
const facultyController = require("../controllers/facultyController");

// 3. Apply Middleware Globally
// (All routes below this line require Login + Faculty Role)
router.use(protect);
router.use(facultyOnly); 

// 4. Define Routes

// GET /api/faculty/courses 
// Returns the list of subjects taught by this teacher
router.get("/courses", facultyController.getAssignedCourses);

// ✅ FIX: Changed :courseId to :offeringId to match the controller
// GET /api/faculty/course/:offeringId/students
router.get("/course/:offeringId/students", facultyController.getStudentsForCourse);

// POST /api/faculty/mark-attendance
// Saves the attendance data
router.post("/mark-attendance", facultyController.markAttendance);

module.exports = router;