const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Ensure Cloudinary is configued (uses existing env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "college_portal_resources", // Separate folder for docs
    resource_type: "raw", // 👈 IMPORTANT: 'raw' allows PDF, DOCX, ZIP, etc.
    allowed_formats: ["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "txt", "zip"],
    // Use original filename + timestamp to prevent duplicates
    public_id: (req, file) => file.originalname.split('.')[0] + "-" + Date.now() 
  },
});

// Create the uploader
const uploadDoc = multer({ storage: storage });

module.exports = uploadDoc;