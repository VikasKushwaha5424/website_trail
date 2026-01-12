const express = require("express");
const router = express.Router();

// 1. Import Middleware (Security)
const { protect, authorize } = require("../middleware/authMiddleware");

// 2. Import Controller Functions
const { 
  addUser, 
  addDepartment, 
  addCourse, 
  createSemester,  // 👈 Added this
  assignFaculty,
  enrollStudent,   // 👈 Added this
  broadcastNotice 
} = require("../controllers/adminController");

// ==========================================
// 🛡️ SECURITY: All Admin Routes are Protected
// ==========================================

// POST /api/admin/add-user (Student/Faculty)
router.post("/add-user", protect, authorize("admin"), addUser);

// POST /api/admin/add-department
router.post("/add-department", protect, authorize("admin"), addDepartment);

// POST /api/admin/add-course
router.post("/add-course", protect, authorize("admin"), addCourse);

// POST /api/admin/create-semester (Active/Inactive logic)
router.post("/create-semester", protect, authorize("admin"), createSemester); // 👈 New Route

// POST /api/admin/assign-faculty
router.post("/assign-faculty", protect, authorize("admin"), assignFaculty);

// POST /api/admin/enroll-student (Manual Enrollment)
router.post("/enroll-student", protect, authorize("admin"), enrollStudent);   // 👈 New Route

// POST /api/admin/broadcast (Alerts)
router.post("/broadcast", protect, authorize("admin"), broadcastNotice);

module.exports = router;