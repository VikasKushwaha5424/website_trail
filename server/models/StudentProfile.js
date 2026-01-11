const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  // 1️⃣ IDENTITY (Link to Login)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  
  // 2️⃣ ACADEMIC IDENTITY
  rollNumber: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true, // "cse-001" -> "CSE-001"
    trim: true
  },

  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department", 
    required: true 
  },

  // 3️⃣ PERSONAL DETAILS (Missing in your old file!)
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  // 4️⃣ ACADEMIC STATUS
  currentSemester: { 
    type: Number, 
    default: 1, 
    min: 1, 
    max: 8 
  },
  
  batchYear: { 
    type: Number, 
    required: true 
  }, // e.g., 2025 (The year they joined)

  // 5️⃣ LEVEL-2 ENHANCEMENTS
  guardianDetails: {
    name: { type: String, default: null },
    phone: { type: String, default: null }
  },
  // Crucial for "Emergency Contact" features in an ERP

  currentStatus: {
    type: String,
    enum: ["ACTIVE", "GRADUATED", "DROPPED", "SUSPENDED"],
    default: "ACTIVE"
  }

}, { timestamps: true });

// 🔎 PERFORMANCE INDEXES
// Fast lookup for: "Find Student by Name"
studentProfileSchema.index({ firstName: 1, lastName: 1 });
// Fast lookup for: "Find all students in CSE Department"
studentProfileSchema.index({ departmentId: 1 });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);