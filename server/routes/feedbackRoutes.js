const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  submitFeedback, 
  getFeedbackStats, 
  getFacultyFeedback // 👈 Added Import
} = require("../controllers/feedbackController");

// Student: Submit
router.post("/", protect, authorize("student"), submitFeedback);

// Admin: View Global Stats
router.get("/stats", protect, authorize("admin"), getFeedbackStats);

// Faculty: View My Performance 🆕
router.get("/my-performance", protect, authorize("faculty"), getFacultyFeedback);

module.exports = router;