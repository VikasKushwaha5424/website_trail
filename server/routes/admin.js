const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { addUser, addDepartment, addCourse, assignFaculty } = require("../controllers/adminController");

// ALL Routes below need Token (protect) AND Admin Role (adminOnly)
router.post("/add-user", protect, adminOnly, addUser);
router.post("/add-dept", protect, adminOnly, addDepartment);
router.post("/add-course", protect, adminOnly, addCourse);
router.post("/assign-faculty", protect, adminOnly, assignFaculty);

module.exports = router;