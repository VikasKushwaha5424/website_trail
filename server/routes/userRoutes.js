const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// GET /api/users/faculty-list
router.get("/faculty-list", protect, async (req, res) => {
  try {
    // ✅ FIX: Use Regex for case-insensitive search (matches "faculty", "Faculty", "FACULTY")
    const faculty = await User.find({ role: { $regex: /^faculty$/i } })
      .select("_id name rollNumber email");
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching faculty list" });
  }
});

// 🚀 LEVEL 3: Upload Profile Photo Route
// POST /api/users/upload-photo
// ✅ FIX: Added 'protect' middleware to secure the route
router.post("/upload-photo", protect, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ FIX: Save the URL to the database
    // req.user is available because of 'protect' middleware
    const user = await User.findById(req.user.id);
    user.profilePicture = req.file.path; // Make sure your User model has this field or allows loose schema
    await user.save();

    res.json({
      message: "Image uploaded and saved successfully!",
      url: req.file.path
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;