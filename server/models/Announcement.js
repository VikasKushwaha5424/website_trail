const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  // 1️⃣ CONTENT
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  message: { 
    type: String, 
    required: true 
  },

  // 2️⃣ TARGETING
  // "ALL" = College Wide, "STUDENT" = Specific Class (if courseOfferingId exists)
  targetAudience: { 
    type: String, 
    enum: ["ALL", "FACULTY", "STUDENT", "ADMIN"], 
    default: "ALL" 
  },

  // 🆕 NEW: Link this notice to a specific class section
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering",
    default: null 
  },

  // Optional Filters (Keep your existing logic)
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department",
    default: null 
  },
  
  batchYear: {
    type: Number,
    default: null
  },

  // 3️⃣ META DATA
  // Renamed to 'createdBy' to match your existing pattern (instead of postedBy)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  isImportant: { 
    type: Boolean, 
    default: false 
  }, 

  expiresAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);