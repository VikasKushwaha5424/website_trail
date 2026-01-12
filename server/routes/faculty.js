const express = require("express");
const router = express.Router();

// 1. Import Middleware
const { protect, facultyOnly } = require("../middleware/authMiddleware"); 

// 2. Import Controller
const facultyController = require("../controllers/facultyController");

// 3. Apply Middleware Globally
router.use(protect);
router.use(facultyOnly); 

// 4. Define Routes

// GET /api/faculty/courses 
router.get("/courses", facultyController.getAssignedCourses);

// GET /api/faculty/course/:offeringId/students
router.get("/course/:offeringId/students", facultyController.getStudentsForCourse);

// POST /api/faculty/mark-attendance
router.post("/mark-attendance", facultyController.markAttendance);

// POST /api/faculty/update-marks
router.post("/update-marks", facultyController.updateMarks); // 👈 New Route

module.exports = router;