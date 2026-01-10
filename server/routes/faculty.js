const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // The security guard
const { getProfile, getCourses, markAttendance } = require("../controllers/facultyController");

// All these routes require a valid Token (Login)
router.get("/profile", protect, getProfile);
router.get("/courses", protect, getCourses);
router.post("/attendance", protect, markAttendance);

module.exports = router;