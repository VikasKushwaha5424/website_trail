const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FacultyProfile = require("../models/FacultyProfile"); // ✅ Added Import
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// =========================================================
// 1. GET FACULTY LIST (Rich Data with Department)
// =========================================================
router.get("/faculty-list", protect, async (req, res) => {
  try {
    // ✅ FIX: Query FacultyProfile to get Department & Qualifications
    const facultyList = await FacultyProfile.find()
      .populate("userId", "name email profilePicture") // Get Name/Email/Photo from User
      .populate("departmentId", "name code");          // Get Department Name

    // Format the data for the frontend directory
    const result = facultyList
      .filter(f => f.userId) // Safety check: Ensure User account still exists
      .map(f => ({
        _id: f.userId._id, // Keep the User ID as the main key
        name: f.userId.name,
        email: f.userId.email,
        photo: f.userId.profilePicture,
        department: f.departmentId ? f.departmentId.name : "Unassigned",
        qualification: f.qualification
      }));

    res.json(result);
  } catch (err) {
    console.error("Faculty List Error:", err);
    res.status(500).json({ message: "Server error fetching faculty list" });
  }
});

// =========================================================
// 2. UPLOAD PROFILE PHOTO
// =========================================================
router.post("/upload-photo", protect, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // req.user is available because of 'protect' middleware
    const user = await User.findById(req.user.id);
    
    // Save Cloudinary URL to database
    user.profilePicture = req.file.path; 
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