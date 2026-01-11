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

  // 2️⃣ TARGETING (Who sees this?)
  targetAudience: { 
    type: String, 
    enum: ["ALL", "FACULTY", "STUDENT", "ADMIN"], 
    default: "ALL" 
  },

  // Optional Filters (Level-2 Feature)
  // Example: Send only to "CSE" department
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department",
    default: null 
  },
  
  // Example: Send only to "Year 1" students
  batchYear: {
    type: Number,
    default: null
  },

  // 3️⃣ META DATA
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  isImportant: { 
    type: Boolean, 
    default: false 
  }, // Highlights the notice in Red/Bold on frontend

  expiresAt: {
    type: Date,
    default: null
  }
  // Frontend logic: Don't show if Date.now() > expiresAt

}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);