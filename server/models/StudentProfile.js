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
    // ⚠️ FIX: Removed 'required: true' to allow 'null' during initial registration
    default: null 
  },

  // 3️⃣ PERSONAL DETAILS
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  // ⚠️ FIX: Made lastName optional for students with single names
  lastName: { 
    type: String, 
    trim: true,
    default: "" 
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
  }, // e.g., 2025

  // 5️⃣ LEVEL-2 ENHANCEMENTS
  guardianDetails: {
    name: { type: String, default: null },
    phone: { type: String, default: null }
  },

  currentStatus: {
    type: String,
    enum: ["ACTIVE", "GRADUATED", "DROPPED", "SUSPENDED"],
    default: "ACTIVE"
  },

  // =========================================================
  // 6️⃣ RESIDENCY DETAILS (Hosteller vs Day Scholar)
  // =========================================================
  residencyType: {
    type: String,
    enum: ["DAY_SCHOLAR", "HOSTELLER"],
    default: "DAY_SCHOLAR", 
    required: true
  },

  // Only populated if residencyType is "HOSTELLER"
  hostelDetails: {
    hostelName: { type: String, default: null }, // e.g., "Boys Hostel A"
    roomNumber: { type: String, default: null }  // e.g., "101"
  }

}, { timestamps: true });

// 🔎 PERFORMANCE INDEXES
studentProfileSchema.index({ firstName: 1, lastName: 1 });
studentProfileSchema.index({ departmentId: 1 });
studentProfileSchema.index({ residencyType: 1 }); // Index for filtering hostellers

module.exports = mongoose.model("StudentProfile", studentProfileSchema);