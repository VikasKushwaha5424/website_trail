const express = require("express");
const router = express.Router();
const uploadDoc = require("../middleware/docUploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  uploadResource, 
  getCourseResources, 
  deleteResource 
} = require("../controllers/resourceController");

router.use(protect);

// Upload (Faculty Only)
router.post("/upload", authorize("faculty"), uploadDoc.single("file"), uploadResource);

// View (Students & Faculty)
router.get("/:courseOfferingId", getCourseResources);

// Delete (Faculty Only)
router.delete("/:id", authorize("faculty"), deleteResource);

module.exports = router;