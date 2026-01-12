const express = require("express");
const router = express.Router();
const feeController = require("../controllers/feeController");
const { protect, authorize } = require("../middleware/authMiddleware");

// 🔒 Apply Protection Globally
router.use(protect);

// GET: /api/fees/my-dues (Removed :studentId param to prevent IDOR)
router.get("/my-dues", authorize("student"), feeController.getMyDueFees);

// POST: /api/fees/pay (Only students pay, or add admin logic)
router.post("/pay", authorize("student"), feeController.payFee);

module.exports = router;