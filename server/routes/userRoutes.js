const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// GET /api/users/faculty-list
router.get("/faculty-list", protect, async (req, res) => {
  try {
    const faculty = await User.find({ role: "Faculty" }).select("_id name rollNumber email");
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching faculty list" });
  }
});

module.exports = router;