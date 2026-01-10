const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getProfile, getMyCourses, getAttendance, getMarks } = require("../controllers/studentController");

// All routes require the user to be logged in (protect)
router.get("/profile", protect, getProfile);
router.get("/courses", protect, getMyCourses);
router.get("/attendance", protect, getAttendance);
router.get("/marks", protect, getMarks);

module.exports = router;