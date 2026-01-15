const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getElectives, enrollElective, dropElective } = require("../controllers/electiveController");

router.get("/list", protect, authorize("student"), getElectives);
router.post("/enroll", protect, authorize("student"), enrollElective);
router.post("/drop", protect, authorize("student"), dropElective);

module.exports = router;