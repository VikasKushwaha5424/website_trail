const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { submitFeedback, getFeedbackStats } = require("../controllers/feedbackController");

// Student: Submit
router.post("/", protect, authorize("student"), submitFeedback);

// Admin: View Stats
router.get("/stats", protect, authorize("admin"), getFeedbackStats);

module.exports = router;