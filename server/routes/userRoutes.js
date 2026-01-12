const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // <--- Import the new middleware

// GET /api/users/faculty-list
router.get("/faculty-list", protect, async (req, res) => {
  try {
    const faculty = await User.find({ role: "Faculty" }).select("_id name rollNumber email");
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching faculty list" });
  }
});

// 🚀 LEVEL 3: Upload Profile Photo Route
// POST /api/users/upload-photo
// Expects form-data with key 'photo'
router.post("/upload-photo", upload.single("photo"), (req, res) => {
  try {
    // If the upload middleware works, req.file will exist
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Cloudinary automatically gives us the public URL in req.file.path
    res.json({
      message: "Image uploaded successfully!",
      url: req.file.path
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;