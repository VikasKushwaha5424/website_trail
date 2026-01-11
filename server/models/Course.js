const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  // 1️⃣ IDENTITY (The Catalog Entry)
  name: { 
    type: String, 
    required: true, 
    trim: true 
  }, 
  // e.g., "Data Structures & Algorithms" (Formerly 'subjectName')

  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true
  }, 
  // e.g., "CS-201" (Formerly 'subjectCode')

  // 2️⃣ ACADEMIC DETAILS
  credits: { 
    type: Number, 
    required: true 
  },
  
  type: { 
    type: String, 
    enum: ["CORE", "ELECTIVE", "LAB", "PROJECT"], 
    default: "CORE",
    required: true
  },
  // Helps in calculating CGPA differently for Labs vs Theory

  // 3️⃣ RELATIONS
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department", 
    required: true 
  },

  // 4️⃣ CONTROL
  isActive: { 
    type: Boolean, 
    default: true 
  }
  // Set to false if the college stops teaching this subject 
  // (but keeps history of students who took it).

}, { timestamps: true });

// Compound Index: Ensure a department doesn't have two courses with the same name
courseSchema.index({ departmentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Course", courseSchema);