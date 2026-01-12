const express = require("express");
const router = express.Router();
const feeController = require("../controllers/feeController");

router.get("/student/:studentId", feeController.getMyDueFees);
router.post("/pay", feeController.payFee);

module.exports = router;