const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");

router.get("/student/:studentId", timetableController.getMyTimetable);
router.post("/add", timetableController.addSlot);

module.exports = router;