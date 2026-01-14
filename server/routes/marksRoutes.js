const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  getClassList, 
  updateMarks, 
  getCourseMarks, 
  publishResults, 
  getStudentResults 
} = require("../controllers/marksController");

// Faculty Routes
router.get("/class-list", protect, authorize("faculty"), getClassList);
router.get("/faculty-view", protect, authorize("faculty"), getCourseMarks);
router.post("/update", protect, authorize("faculty"), updateMarks);

// Admin Routes
router.post("/publish", protect, authorize("admin"), publishResults);

// Student Routes
router.get("/my-results", protect, authorize("student"), getStudentResults);

module.exports = router;