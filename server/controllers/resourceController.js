const Resource = require("../models/Resource");

// 1. Upload a New Resource
exports.uploadResource = async (req, res) => {
  try {
    const { courseOfferingId, title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newResource = await Resource.create({
      title,
      fileUrl: req.file.path, // Cloudinary URL
      fileType: req.file.originalname.split('.').pop(), // Extract extension
      courseOfferingId,
      uploadedBy: req.user.id
    });

    res.status(201).json(newResource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get Resources for a Course
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

// 3. Delete Resource (Faculty Only)
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await Resource.findByIdAndDelete(id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};