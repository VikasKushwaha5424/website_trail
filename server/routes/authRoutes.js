const express = require("express");
const router = express.Router();

// 1. Import Middleware (Security)
const { protect, authorize } = require("../middleware/authMiddleware");

// 2. Import Controller Functions
const { 
  addUser, 
  addDepartment, 
  addCourse, 
  assignFaculty,
  broadcastNotice // <--- 🚀 NEW IMPORT (Level 4)
} = require("../controllers/adminController");

// ==========================================
// 🛡️ SECURITY: All Admin Routes are Protected
// ==========================================
// You can apply middleware to all routes at once if you want:
// router.use(protect);
// router.use(authorize("admin"));

// ==========================================
// 🚦 ROUTES
// ==========================================

// POST /api/admin/add-user (Student/Faculty)
router.post("/add-user", protect, authorize("admin"), addUser);

// POST /api/admin/add-department
router.post("/add-department", protect, authorize("admin"), addDepartment);

// POST /api/admin/add-course
router.post("/add-course", protect, authorize("admin"), addCourse);

// POST /api/admin/assign-faculty
router.post("/assign-faculty", protect, authorize("admin"), assignFaculty);

// 🚀 LEVEL 4: Broadcast Alert Route
// POST /api/admin/broadcast
router.post("/broadcast", protect, authorize("admin"), broadcastNotice);

module.exports = router;