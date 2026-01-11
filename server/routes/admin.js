const express = require("express");
const router = express.Router();
// Import BOTH middlewares
const { protect, adminOnly } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// 1. Protect all routes (Must be logged in)
router.use(protect);

// 2. Restrict to Admins Only (Must be an Admin)
router.use(adminOnly);

// Routes
router.post("/add-user", adminController.addUser);
router.post("/add-dept", adminController.addDepartment);
router.post("/add-course", adminController.addCourse);
router.post("/assign-faculty", adminController.assignFaculty);

module.exports = router;