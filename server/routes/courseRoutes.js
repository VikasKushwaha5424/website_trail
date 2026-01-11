const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { protect } = require("../middleware/authMiddleware");

// GET /api/courses
router.get("/", protect, async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching courses" });
  }
});

module.exports = router;