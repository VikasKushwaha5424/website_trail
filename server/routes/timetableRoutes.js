const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

// Import all 4 functions from the controller
const { 
  getMyTimetable,       // Student Weekly
  getFacultyTimetable,  // Faculty Weekly (New)
  getMyDailySchedule,   // Dashboard Widget (Both)
  addSlot               // Add Class (Admin)
} = require("../controllers/timetableController");

// 🔒 Apply Authentication to all routes
router.use(protect);

// ==========================================
// 📅 VIEW SCHEDULES
// ==========================================

// 1. Student Weekly Schedule
// (Logic looks for StudentProfile)
router.get("/my-schedule", authorize("student"), getMyTimetable);

// 2. Faculty Weekly Schedule 🆕
// (Logic looks for FacultyProfile - matches your new page)
router.get("/faculty", authorize("faculty"), getFacultyTimetable);

// 3. Daily Schedule (For Dashboard Widget)
// (Logic handles both roles)
router.get("/daily", authorize("student", "faculty"), getMyDailySchedule);

// ==========================================
// ✏️ MANAGE SCHEDULES
// ==========================================

// 4. Add Class Slot
router.post("/add", authorize("admin"), addSlot);

module.exports = router;