const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const { protect, authorize } = require("../middleware/authMiddleware");

// 🔒 Protect All Routes globally
router.use(protect);

// ==========================================
// 📅 VIEW SCHEDULES
// ==========================================

// 1. Weekly Schedule (Full View)
// Allows both Students and Faculty to see their weekly classes
router.get("/my-schedule", authorize("student", "faculty"), timetableController.getMyTimetable);

// 2. Daily Schedule (For Dashboard Widget)
// Returns only TODAY'S classes sorted by time
router.get("/daily", authorize("student", "faculty"), timetableController.getMyDailySchedule);

// ==========================================
// ✏️ MANAGE SCHEDULES
// ==========================================

// 3. Add Class Slot (Admin/Faculty Only)
router.post("/add", authorize("admin", "faculty"), timetableController.addSlot);

module.exports = router;