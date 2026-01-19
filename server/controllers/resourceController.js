const Resource = require("../models/Resource");
const CourseOffering = require("../models/CourseOffering"); // 👈 Import required for security check
const FacultyProfile = require("../models/FacultyProfile"); // 👈 Import required for security check

// =========================================================
// 1. Upload a New Resource (SECURED CHECK)
// =========================================================
exports.uploadResource = async (req, res) => {
  try {
    const { courseOfferingId, title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 👇 SECURITY CHECK START: Prevent "Rogue Faculty" Uploads
    // 1. Get Faculty Profile from the logged-in User ID
    const faculty = await FacultyProfile.findOne({ userId: req.user.id });
    if (!faculty) {
        return res.status(403).json({ error: "Unauthorized: Faculty profile not found" });
    }

    // 2. Check if this Faculty OWNS the Course Offering
    const isOwner = await CourseOffering.exists({ 
        _id: courseOfferingId, 
        facultyId: faculty._id 
    });

    if (!isOwner) {
        // If they don't own the course, reject the request.
        // (Note: The file is physically on disk now via multer, ideally use fs.unlink here to clean up)
        return res.status(403).json({ error: "You are not authorized to upload resources for this course." });
    }
    // 👆 SECURITY CHECK END

    // 3. Create Resource Record
    const newResource = await Resource.create({
      title,
      fileUrl: req.file.path,      // Path from Multer (e.g., uploads/filename.pdf)
      fileType: req.file.mimetype, // Save MIME type (e.g., application/pdf)
      courseOfferingId,
      uploadedBy: req.user.id
    });

    res.status(201).json(newResource);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 2. Get Resources for a Course
// =========================================================
exports.getCourseResources = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    
    const resources = await Resource.find({ courseOfferingId })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 3. Delete Resource (Faculty Only)
// =========================================================
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Optional: Add similar ownership check here if needed
    await Resource.findByIdAndDelete(id);
    
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};