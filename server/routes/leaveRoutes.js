const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  applyLeave, 
  getMyLeaves, 
  getAllLeaves, 
  updateLeaveStatus 
} = require("../controllers/leaveController");

// Faculty Routes
router.post("/apply", protect, authorize("faculty"), applyLeave);
router.get("/my-history", protect, authorize("faculty"), getMyLeaves);

// Admin Routes
router.get("/all", protect, authorize("admin"), getAllLeaves);
router.post("/update-status", protect, authorize("admin"), updateLeaveStatus);

module.exports = router;