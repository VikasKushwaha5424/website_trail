const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  // 1️⃣ THE STUDENT
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "StudentProfile", 
    required: true 
  },

  // 2️⃣ THE SPECIFIC CLASS (Not just the generic course)
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering", 
    required: true 
  },

  // 3️⃣ ACADEMIC STATUS
  status: { 
    type: String, 
    enum: ["ENROLLED", "DROPPED", "COMPLETED", "FAILED"], 
    default: "ENROLLED" 
  },

  grade: { 
    type: String, 
    default: null 
  }, // "A+", "B", "F"

  enrollmentDate: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// 🛡️ PREVENT DUPLICATES
// A student cannot enroll in the same class twice in the same semester
enrollmentSchema.index({ studentId: 1, courseOfferingId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);