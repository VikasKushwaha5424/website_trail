const express = require("express");
const router = express.Router();
const hostelController = require("../controllers/hostelController");
const { protect, authorize } = require("../middleware/authMiddleware");

// 🔒 Protect all routes
router.use(protect);

// Only Admins can allocate rooms
router.post("/allocate", authorize("admin"), hostelController.allocateRoom);

module.exports = router;