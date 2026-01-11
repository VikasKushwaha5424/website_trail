const express = require("express");
const router = express.Router();

// 1. Import Middleware
// We use 'authorize' to strictly allow only 'admin' role
const { protect, authorize } = require("../middleware/authMiddleware"); 

// 2. Import Controller
const adminController = require("../controllers/adminController");

// 3. Apply Middleware Globally
// All routes below require the user to be logged in AND have the role 'admin'
router.use(protect);
router.use(authorize("admin", "Admin")); 

// 4. Define Routes

// POST /api/admin/add-user
// Creates a new Student or Faculty
router.post("/add-user", adminController.addUser);

// POST /api/admin/add-department
// Adds a new Department (e.g., CSE, ECE)
router.post("/add-department", adminController.addDepartment);

// POST /api/admin/add-course
// Adds a new Subject/Course
router.post("/add-course", adminController.addCourse);

// POST /api/admin/assign-faculty
// Assigns a teacher to a specific subject
router.post("/assign-faculty", adminController.assignFaculty);

module.exports = router;