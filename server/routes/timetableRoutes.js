const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const { protect, authorize } = require("../middleware/authMiddleware"); // Import Auth Middleware

// 🔒 Protect All Routes
router.use(protect);

// ✅ FIX: Removed ":studentId" param. 
// Uses "my-schedule" to indicate it returns the logged-in user's data.
router.get("/my-schedule", authorize("student"), timetableController.getMyTimetable);

// ✅ FIX: Added Authorization. Only Admin/Faculty can add slots.
router.post("/add", authorize("admin", "faculty"), timetableController.addSlot);

module.exports = router;