const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  // 1️⃣ THE CONTEXT (Who and Where)
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "StudentProfile", 
    required: true 
  },
  
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering", 
    required: true 
  },

  // 2️⃣ THE DATA (When and What)
  date: { 
    type: Date, 
    required: true 
  },
  
  status: { 
    type: String, 
    enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"], 
    required: true 
  },

  // 3️⃣ CONTROL & AUDIT (Level-2 Features)
  markedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }, 
  // Who marked this? (Usually the Faculty, but could be Admin correcting a mistake)

  isLocked: { 
    type: Boolean, 
    default: false 
  } 
  // If true, the Faculty cannot change it anymore. 
  // (Useful for "Lock attendance 24 hours after class" logic)

}, { timestamps: true });

// 🛡️ INDEXING FOR SPEED
// 1. "Prevent Duplicate Attendance": A student can't be marked twice for the same class on the same day.
attendanceSchema.index({ studentId: 1, courseOfferingId: 1, date: 1 }, { unique: true });

// 2. "Show me Student X's attendance": Fast lookup for student dashboards.
attendanceSchema.index({ studentId: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);