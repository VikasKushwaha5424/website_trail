const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// 1. Apply Middleware to ALL routes in this file
// (User must be logged in AND be an Admin)
router.use(protect);
router.use(adminOnly);

// 2. Define Routes

// POST /api/admin/add-user
router.post("/add-user", adminController.addUser);

// POST /api/admin/assign-faculty
router.post("/assign-faculty", adminController.assignFaculty);

// POST /api/admin/add-dept
router.post("/add-dept", adminController.addDepartment);

// POST /api/admin/add-course
router.post("/add-course", adminController.addCourse);

module.exports = router;