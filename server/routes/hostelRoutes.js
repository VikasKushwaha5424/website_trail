const express = require("express");
const router = express.Router();
const hostelController = require("../controllers/hostelController");

router.post("/allocate", hostelController.allocateRoom);

module.exports = router;